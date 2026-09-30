const db = require('../../db');

// Ward Admin: Assign Doctor to Ward
exports.assignDoctor = async (req, res) => {
    const { doctor_id } = req.body;
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Find the ward belonging to this login_id
        const wardRes = await client.query('SELECT hospital_id, ward_id FROM wards WHERE login_id = $1', [req.user.id]);
        if (wardRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'You are not associated with any ward' });
        }

        const { hospital_id, ward_id } = wardRes.rows[0];

        // Insert into ward_doctors table directly
        await client.query(
            'INSERT INTO ward_doctors (hospital_id, ward_id, doctor_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
            [hospital_id, ward_id, doctor_id]
        );

        await client.query('COMMIT');
        res.json({ message: 'Doctor assigned to ward successfully' });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Error assigning doctor', error: err.message });
    } finally {
        client.release();
    }
};

// Ward Admin: Assign Nurse to Ward
exports.assignNurse = async (req, res) => {
    const { nurse_id } = req.body;
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const wardRes = await client.query('SELECT hospital_id, ward_id FROM wards WHERE login_id = $1', [req.user.id]);
        if (wardRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'You are not associated with any ward' });
        }

        const { hospital_id, ward_id } = wardRes.rows[0];

        // Insert into ward_nurses table directly
        await client.query(
            'INSERT INTO ward_nurses (hospital_id, ward_id, nurse_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
            [hospital_id, ward_id, nurse_id]
        );

        await client.query('COMMIT');
        res.json({ message: 'Nurse assigned to ward successfully' });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Error assigning nurse', error: err.message });
    } finally {
        client.release();
    }
};

// Ward Admin: Create and assign a patient
exports.createPatient = async (req, res) => {
    const { name, b_day, nic, telephone, address, bed_no } = req.body;

    if (!bed_no) {
        return res.status(400).json({ message: 'bed_no is required' });
    }

    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const wardRes = await client.query('SELECT hospital_id, ward_id FROM wards WHERE login_id = $1', [req.user.id]);
        if (wardRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'You are not associated with any ward' });
        }

        const { hospital_id, ward_id } = wardRes.rows[0];

        // Check if patient exists by NIC
        const existingPatient = await client.query('SELECT * FROM patients WHERE nic = $1', [nic]);

        if (existingPatient.rows.length > 0) {
            const oldPatient = existingPatient.rows[0];

            // Check if another active patient already has this bed in this ward
            const existingBed = await client.query(
                'SELECT id FROM patients WHERE hospital_id = $1 AND ward_id = $2 AND bed_no = $3 AND is_discharged = false AND id != $4',
                [hospital_id, ward_id, bed_no, oldPatient.id]
            );
            if (existingBed.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: 'Bed ' + bed_no + ' is already occupied in this ward.' });
            }

            // Update the existing patient with new details, re-assign them, and set is_discharged to false
            const updateRes = await client.query(
                `UPDATE patients 
                 SET name = $1, b_day = $2, telephone = $3, address = $4, hospital_id = $5, ward_id = $6, bed_no = $7, is_discharged = false, updated_at = NOW() 
                 WHERE id = $8 RETURNING *`,
                [name, b_day, telephone, address, hospital_id, ward_id, bed_no, oldPatient.id]
            );

            await client.query('COMMIT');
            return res.status(200).json({
                message: 'Patient previously existed. Profile updated and re-admitted successfully.',
                old_details: oldPatient,
                patient: updateRes.rows[0]
            });
        }

        // Check if another active patient already has this bed in this ward
        const existingBed = await client.query(
            'SELECT id FROM patients WHERE hospital_id = $1 AND ward_id = $2 AND bed_no = $3 AND is_discharged = false',
            [hospital_id, ward_id, bed_no]
        );
        if (existingBed.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Bed ' + bed_no + ' is already occupied in this ward.' });
        }

        // Insert new patient
        const patientRes = await client.query(
            'INSERT INTO patients (name, b_day, nic, telephone, address, hospital_id, ward_id, bed_no) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [name, b_day, nic, telephone, address, hospital_id, ward_id, bed_no]
        );

        await client.query('COMMIT');
        res.status(201).json({ message: 'Patient created and assigned to ward', patient: patientRes.rows[0] });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Error creating patient', error: err.message });
    } finally {
        client.release();
    }
};

// Ward Admin: Discharge a patient
exports.dischargePatient = async (req, res) => {
    const { patient_id } = req.params;
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Ensure the ward doing the discharge actually owns the patient
        const wardRes = await client.query('SELECT hospital_id, ward_id FROM wards WHERE login_id = $1', [req.user.id]);
        if (wardRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'You are not associated with any ward' });
        }

        const { hospital_id, ward_id } = wardRes.rows[0];

        const updateRes = await client.query(
            'UPDATE patients SET is_discharged = true, updated_at = NOW() WHERE id = $1 AND hospital_id = $2 AND ward_id = $3 RETURNING *',
            [patient_id, hospital_id, ward_id]
        );

        if (updateRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Patient not found or you do not have permission to discharge them' });
        }

        await client.query('COMMIT');
        res.json({ message: 'Patient discharged successfully', patient: updateRes.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Error discharging patient', error: err.message });
    } finally {
        client.release();
    }
};

// Ward Admin: Toggle Patient Critical State
exports.toggleCriticalPatient = async (req, res) => {
    const { bed_no } = req.params;
    const { is_critical } = req.body;
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const wardRes = await client.query('SELECT hospital_id, ward_id FROM wards WHERE login_id = $1', [req.user.id]);
        if (wardRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'You are not associated with any ward' });
        }
        const { hospital_id, ward_id } = wardRes.rows[0];

        const updateRes = await client.query(
            'UPDATE patients SET is_critical = $1, updated_at = NOW() WHERE hospital_id = $2 AND ward_id = $3 AND bed_no = $4 AND is_discharged = false RETURNING *',
            [is_critical, hospital_id, ward_id, bed_no]
        );

        if (updateRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Active patient not found in this bed' });
        }

        await client.query('COMMIT');
        res.json({ message: `Patient marked as ${is_critical ? 'critical' : 'stable'}`, patient: updateRes.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Error toggling critical state', error: err.message });
    } finally {
        client.release();
    }
};

// Ward Admin: Get Ward Information
exports.getWardDetails = async (req, res) => {
    try {
        const wardRes = await db.query(
            `SELECT w.hospital_id, w.ward_id, w.beds, h.name as hospital_name 
             FROM wards w 
             JOIN hospitals h ON w.hospital_id = h.id 
             WHERE w.login_id = $1`,
            [req.user.id]
        );

        if (wardRes.rows.length === 0) {
            return res.status(404).json({ message: 'Ward not found for current user' });
        }

        res.json({ ward: wardRes.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching ward details', error: err.message });
    }
};

// Ward Admin: Get Patients in this Ward
exports.getWardPatients = async (req, res) => {
    try {
        const wardRes = await db.query('SELECT hospital_id, ward_id FROM wards WHERE login_id = $1', [req.user.id]);

        if (wardRes.rows.length === 0) {
            return res.status(403).json({ message: 'You are not associated with any ward' });
        }

        const { hospital_id, ward_id } = wardRes.rows[0];

        const patientsRes = await db.query(
            `SELECT 
                id, name, nic, telephone, address, bed_no, is_critical,
                EXTRACT(YEAR FROM age(current_date, b_day)) as age 
             FROM patients 
             WHERE hospital_id = $1 AND ward_id = $2 AND is_discharged = false
             ORDER BY bed_no ASC`,
            [hospital_id, ward_id]
        );

        res.json({ patients: patientsRes.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching patients', error: err.message });
    }
};

// Ward Admin: Get available Doctors in the same Hospital
exports.getHospitalDoctors = async (req, res) => {
    try {
        const wardRes = await db.query('SELECT hospital_id FROM wards WHERE login_id = $1', [req.user.id]);
        if (wardRes.rows.length === 0) return res.status(403).json({ message: 'Not associated with any ward' });

        const { hospital_id } = wardRes.rows[0];
        const docs = await db.query('SELECT id, name FROM doctors WHERE hospital_id = $1 ORDER BY name ASC', [hospital_id]);
        res.json({ doctors: docs.rows });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching doctors', error: err.message });
    }
};

// Ward Admin: Get available Nurses in the same Hospital
exports.getHospitalNurses = async (req, res) => {
    try {
        const wardRes = await db.query('SELECT hospital_id FROM wards WHERE login_id = $1', [req.user.id]);
        if (wardRes.rows.length === 0) return res.status(403).json({ message: 'Not associated with any ward' });

        const { hospital_id } = wardRes.rows[0];
        const nurses = await db.query('SELECT id, name FROM nurses WHERE hospital_id = $1 ORDER BY name ASC', [hospital_id]);
        res.json({ nurses: nurses.rows });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching nurses', error: err.message });
    }
};
