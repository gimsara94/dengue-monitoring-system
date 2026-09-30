const db = require('../../db');
const { createLogin } = require('../models/authModel');

// Helper to get the hospital_id based on the logged in user's login_id
const getHospitalIdFromLogin = async (login_id) => {
    const result = await db.query('SELECT id FROM hospitals WHERE login_id = $1', [login_id]);
    if (result.rows.length === 0) throw new Error('Hospital associated with this login not found');
    return result.rows[0].id;
};

// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        const hospital_id = await getHospitalIdFromLogin(req.user.id);

        // Fetch hospital name
        const hospitalRes = await db.query('SELECT name FROM hospitals WHERE id = $1', [hospital_id]);
        const hospitalName = hospitalRes.rows[0]?.name || 'Your Hospital';

        // Stats counts
        const docCount = await db.query('SELECT COUNT(*) FROM doctors WHERE hospital_id = $1', [hospital_id]);
        const nurseCount = await db.query('SELECT COUNT(*) FROM nurses WHERE hospital_id = $1', [hospital_id]);
        const patientCount = await db.query('SELECT COUNT(*) FROM patients WHERE hospital_id = $1 AND is_discharged = false', [hospital_id]);

        // Breakdown by ward
        const wardStats = await db.query(`
            SELECT ward_id, COUNT(*) as count
            FROM patients
            WHERE hospital_id = $1 AND is_discharged = false
            GROUP BY ward_id
            ORDER BY ward_id
        `, [hospital_id]);

        const patientsByWard = wardStats.rows.map(row => ({
            wardName: `Ward ${row.ward_id}`,
            count: parseInt(row.count, 10)
        }));

        res.status(200).json({
            hospitalName,
            totalDoctors: parseInt(docCount.rows[0].count, 10),
            totalNurses: parseInt(nurseCount.rows[0].count, 10),
            totalAdmittedPatients: parseInt(patientCount.rows[0].count, 10),
            patientsByWard
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching stats', error: err.message });
    }
};

// --- Wards CRUD ---
exports.createWard = async (req, res) => {
    const { ward_id, beds, username, password } = req.body;
    const client = await db.getClient();
    try {
        const hospital_id = await getHospitalIdFromLogin(req.user.id);

        await client.query('BEGIN');

        // 1. Create Login for Ward
        const login_id = await createLogin(client, username, password, 'wordmain');

        // 2. Create Ward
        const wardRes = await client.query(
            'INSERT INTO wards (hospital_id, ward_id, beds, login_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [hospital_id, ward_id, beds, login_id]
        );

        await client.query('COMMIT');
        res.status(201).json({ message: 'Ward created', ward: wardRes.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Error creating ward', error: err.message });
    } finally {
        client.release();
    }
};

// --- Doctors CRUD ---

exports.createDoctor = async (req, res) => {
    const { name, telephone, nic_no, address, email, username, password } = req.body;
    const login_id_admin = req.user.id; // The logged-in hospital's login ID

    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        // Find hospital ID
        const hospitalRes = await client.query('SELECT id FROM hospitals WHERE login_id = $1', [login_id_admin]);
        if (hospitalRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'No hospital profile linked to this account.' });
        }
        const hospital_id = hospitalRes.rows[0].id;

        const new_login_id = await createLogin(client, username, password, 'doctor');

        const docRes = await client.query(
            'INSERT INTO doctors (name, telephone, nic_no, address, email, login_id, hospital_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, telephone, nic_no, address, email, new_login_id, hospital_id]
        );

        await client.query('COMMIT');
        res.status(201).json({ message: 'Doctor created successfully', doctor: docRes.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Error creating doctor', error: err.message });
    } finally {
        client.release();
    }
};

exports.getDoctors = async (req, res) => {
    try {
        const hospital_id = await getHospitalIdFromLogin(req.user.id);
        const result = await db.query(`
            SELECT d.*, l.username
            FROM doctors d
            LEFT JOIN logins l ON d.login_id = l.id
            WHERE d.hospital_id = $1
            ORDER BY d.id
        `, [hospital_id]);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching', error: err.message });
    }
};

exports.updateDoctor = async (req, res) => {
    const { id } = req.params;
    const { name, telephone, address, email } = req.body;
    try {
        const hospital_id = await getHospitalIdFromLogin(req.user.id);
        const result = await db.query(
            'UPDATE doctors SET name = COALESCE($1, name), telephone = COALESCE($2, telephone), address = COALESCE($3, address), email = COALESCE($4, email) WHERE id = $5 AND hospital_id = $6 RETURNING *',
            [name, telephone, address, email, id, hospital_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found or unauthorized' });
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error updating', error: err.message });
    }
};

exports.deleteDoctor = async (req, res) => {
    const { id } = req.params;
    const client = await db.getClient();
    try {
        const hospital_id = await getHospitalIdFromLogin(req.user.id);

        await client.query('BEGIN');
        // Delete only if it belongs to this hospital
        const docRes = await client.query('DELETE FROM doctors WHERE id = $1 AND hospital_id = $2 RETURNING login_id', [id, hospital_id]);

        if (docRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Not found or unauthorized' });
        }

        if (docRes.rows[0].login_id) {
            await client.query('DELETE FROM logins WHERE id = $1', [docRes.rows[0].login_id]);
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Error deleting', error: err.message });
    } finally {
        client.release();
    }
};


// --- Nurses CRUD ---

exports.createNurse = async (req, res) => {
    const { name, telephone, nic_no, address, email, username, password } = req.body;
    const login_id_admin = req.user.id;

    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const hospitalRes = await client.query('SELECT id FROM hospitals WHERE login_id = $1', [login_id_admin]);
        if (hospitalRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'No hospital profile linked to this account.' });
        }
        const hospital_id = hospitalRes.rows[0].id;

        const new_login_id = await createLogin(client, username, password, 'nurse');

        const nurseRes = await client.query(
            'INSERT INTO nurses (name, telephone, nic_no, address, email, login_id, hospital_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, telephone, nic_no, address, email, new_login_id, hospital_id]
        );

        await client.query('COMMIT');
        res.status(201).json({ message: 'Nurse created successfully', nurse: nurseRes.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Error creating nurse', error: err.message });
    } finally {
        client.release();
    }
};

exports.getNurses = async (req, res) => {
    try {
        const hospital_id = await getHospitalIdFromLogin(req.user.id);
        const result = await db.query(`
            SELECT n.*, l.username
            FROM nurses n
            LEFT JOIN logins l ON n.login_id = l.id
            WHERE n.hospital_id = $1
            ORDER BY n.id
        `, [hospital_id]);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching', error: err.message });
    }
};

exports.updateNurse = async (req, res) => {
    const { id } = req.params;
    const { name, telephone, address, email } = req.body;
    try {
        const hospital_id = await getHospitalIdFromLogin(req.user.id);
        const result = await db.query(
            'UPDATE nurses SET name = COALESCE($1, name), telephone = COALESCE($2, telephone), address = COALESCE($3, address), email = COALESCE($4, email) WHERE id = $5 AND hospital_id = $6 RETURNING *',
            [name, telephone, address, email, id, hospital_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found or unauthorized' });
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error updating', error: err.message });
    }
};

exports.deleteNurse = async (req, res) => {
    const { id } = req.params;
    const client = await db.getClient();
    try {
        const hospital_id = await getHospitalIdFromLogin(req.user.id);

        await client.query('BEGIN');
        const nurseRes = await client.query('DELETE FROM nurses WHERE id = $1 AND hospital_id = $2 RETURNING login_id', [id, hospital_id]);

        if (nurseRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Not found or unauthorized' });
        }

        if (nurseRes.rows[0].login_id) {
            await client.query('DELETE FROM logins WHERE id = $1', [nurseRes.rows[0].login_id]);
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Error deleting', error: err.message });
    } finally {
        client.release();
    }
};
