const db = require('../../db');
const bcrypt = require('bcryptjs');
const { createLogin } = require('../models/authModel');

// Admin: Create another Admin
exports.createAdmin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const check = await db.query('SELECT * FROM logins WHERE username = $1', [username]);
        if (check.rows.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const client = await db.getClient();
        try {
            await client.query('BEGIN');
            const login_id = await createLogin(client, username, password, 'admin');
            await client.query('COMMIT');
            res.status(201).json({ message: 'Admin created', user: { id: login_id, username, role: 'admin' } });
        } catch (txnErr) {
            await client.query('ROLLBACK');
            throw txnErr;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating admin', error: err.message });
    }
};

// Admin: Create Hospital
exports.createHospital = async (req, res) => {
    const { name, address, telephone, email, username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required for the hospital login" });
    }

    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        // Check if username exists
        const checkUser = await client.query('SELECT id FROM logins WHERE username = $1', [username]);
        if (checkUser.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Username already exists' });
        }

        // 1. Create Login with role 'hospital'
        const login_id = await createLogin(client, username, password, 'hospital');

        // 2. Insert Hospital
        const result = await client.query(
            'INSERT INTO hospitals (name, address, telephone, email, login_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, address, telephone, email, login_id]
        );

        await client.query('COMMIT');
        res.status(201).json({ message: 'Hospital created', hospital: result.rows[0], user: { username, role: 'hospital' } });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Create hospital error:", err);
        res.status(500).json({ message: 'Error creating hospital', error: err.message });
    } finally {
        client.release();
    }
};


// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        const hospitalCount = await db.query('SELECT COUNT(*) FROM hospitals');
        const patientCount = await db.query('SELECT COUNT(*) FROM patients WHERE is_discharged = false');
        const breakdown = await db.query(`
            SELECT h.name as "hospitalName", COUNT(p.id) as count
            FROM hospitals h
            LEFT JOIN patients p ON h.id = p.hospital_id AND p.is_discharged = false
            GROUP BY h.id, h.name
            ORDER BY count DESC
        `);

        res.status(200).json({
            totalHospitals: parseInt(hospitalCount.rows[0].count, 10),
            totalAdmittedPatients: parseInt(patientCount.rows[0].count, 10),
            patientsByHospital: breakdown.rows.map(row => ({
                hospitalName: row.hospitalName,
                count: parseInt(row.count, 10)
            }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching stats', error: err.message });
    }
};

// --- Hospitals CRUD ---
exports.getHospitals = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM hospitals ORDER BY id');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching', error: err.message });
    }
};

exports.updateHospital = async (req, res) => {
    const { id } = req.params;
    const { name, address, telephone, email } = req.body;
    try {
        const result = await db.query(
            'UPDATE hospitals SET name = COALESCE($1, name), address = COALESCE($2, address), telephone = COALESCE($3, telephone), email = COALESCE($4, email) WHERE id = $5 RETURNING *',
            [name, address, telephone, email, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error updating', error: err.message });
    }
};

exports.deleteHospital = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM hospitals WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting (possibly due to dependencies)', error: err.message });
    }
};

// --- Admins CRUD ---
exports.getAdmins = async (req, res) => {
    try {
        const result = await db.query("SELECT id, username, role, created_at FROM logins WHERE role = 'admin' ORDER BY id");
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching', error: err.message });
    }
};

exports.updateAdmin = async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;
    try {
        const result = await db.query(
            "UPDATE logins SET username = COALESCE($1, username) WHERE id = $2 AND role = 'admin' RETURNING id, username, role",
            [username, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error updating', error: err.message });
    }
};

exports.deleteAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("DELETE FROM logins WHERE id = $1 AND role = 'admin' RETURNING *", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting', error: err.message });
    }
};

// --- Doctors CRUD ---
exports.getDoctors = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT d.*, l.username
            FROM doctors d
            LEFT JOIN logins l ON d.login_id = l.id
            ORDER BY d.id
        `);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching', error: err.message });
    }
};

exports.updateDoctor = async (req, res) => {
    const { id } = req.params;
    const { name, telephone, address, email } = req.body;
    try {
        const result = await db.query(
            'UPDATE doctors SET name = COALESCE($1, name), telephone = COALESCE($2, telephone), address = COALESCE($3, address), email = COALESCE($4, email) WHERE id = $5 RETURNING *',
            [name, telephone, address, email, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error updating', error: err.message });
    }
};

exports.deleteDoctor = async (req, res) => {
    const { id } = req.params;
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const docRes = await client.query('DELETE FROM doctors WHERE id = $1 RETURNING login_id', [id]);
        if (docRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Not found' });
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
exports.getNurses = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT n.*, l.username
            FROM nurses n
            LEFT JOIN logins l ON n.login_id = l.id
            ORDER BY n.id
        `);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching', error: err.message });
    }
};

exports.updateNurse = async (req, res) => {
    const { id } = req.params;
    const { name, telephone, address, email } = req.body;
    try {
        const result = await db.query(
            'UPDATE nurses SET name = COALESCE($1, name), telephone = COALESCE($2, telephone), address = COALESCE($3, address), email = COALESCE($4, email) WHERE id = $5 RETURNING *',
            [name, telephone, address, email, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error updating', error: err.message });
    }
};

exports.deleteNurse = async (req, res) => {
    const { id } = req.params;
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const nurseRes = await client.query('DELETE FROM nurses WHERE id = $1 RETURNING login_id', [id]);
        if (nurseRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Not found' });
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

