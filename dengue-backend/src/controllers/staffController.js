const db = require('../../db');

// Get all wards assigned to the logged-in doctor or nurse
exports.getAssignedWards = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role; // 'doctor' or 'nurse'

        let wards = [];

        if (role === 'doctor') {
            const wardsRes = await db.query(
                `SELECT DISTINCT h.id as hospital_id, h.name as hospital_name, wd.ward_id
                 FROM doctors d
                 JOIN ward_doctors wd ON d.id = wd.doctor_id
                 JOIN hospitals h ON wd.hospital_id = h.id
                 WHERE d.login_id = $1`,
                [userId]
            );
            wards = wardsRes.rows;

        } else if (role === 'nurse') {
            const wardsRes = await db.query(
                `SELECT DISTINCT h.id as hospital_id, h.name as hospital_name, wn.ward_id 
                 FROM nurses n
                 JOIN ward_nurses wn ON n.id = wn.nurse_id
                 JOIN hospitals h ON wn.hospital_id = h.id
                 WHERE n.login_id = $1`,
                [userId]
            );
            wards = wardsRes.rows;
        }

        res.json({ message: 'Assigned wards retrieved successfully', wards });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving wards', error: err.message });
    }
};

// Get ward info for a specific hospital-ward pair
exports.getWardInfo = async (req, res) => {
    const { hospital_id, ward_id } = req.params;
    try {
        const wardRes = await db.query(
            `SELECT w.hospital_id, w.ward_id, w.beds, h.name as hospital_name 
             FROM wards w 
             JOIN hospitals h ON w.hospital_id = h.id 
             WHERE w.hospital_id = $1 AND w.ward_id = $2`,
            [hospital_id, ward_id]
        );

        if (wardRes.rows.length === 0) {
            return res.status(404).json({ message: 'Ward not found' });
        }

        res.json({ data: wardRes.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching ward info', error: err.message });
    }
};

// Get patients for a specific hospital-ward pair
exports.getWardPatients = async (req, res) => {
    const { hospital_id, ward_id } = req.params;

    try {
        // Optional Security Check: We could verify if the user actually has access to this hospital_id and ward_id.
        // For now, if they are authenticated as a doctor or nurse, we allow them to query it based on your request.

        const patientsRes = await db.query(
            `SELECT 
                id, 
                name, 
                nic, 
                bed_no, 
                is_critical,
                EXTRACT(YEAR FROM age(current_date, b_day)) as age 
             FROM patients 
             WHERE hospital_id = $1 AND ward_id = $2 AND is_discharged = false
             ORDER BY bed_no ASC`,
            [hospital_id, ward_id]
        );

        res.json({
            message: 'Patients retrieved successfully',
            count: patientsRes.rows.length,
            patients: patientsRes.rows,
            data: patientsRes.rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving patients', error: err.message });
    }
};

// Staff (Doctor/Nurse): Toggle Patient Critical State
exports.toggleCriticalPatient = async (req, res) => {
    const { hospital_id, ward_id, bed_no } = req.params;
    const { is_critical } = req.body;

    try {
        const updateRes = await db.query(
            'UPDATE patients SET is_critical = $1, updated_at = NOW() WHERE hospital_id = $2 AND ward_id = $3 AND bed_no = $4 AND is_discharged = false RETURNING *',
            [is_critical, hospital_id, ward_id, bed_no]
        );

        if (updateRes.rows.length === 0) {
            return res.status(404).json({ message: 'Active patient not found in this bed' });
        }

        res.json({ message: `Patient marked as ${is_critical ? 'critical' : 'stable'}`, patient: updateRes.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error toggling critical state', error: err.message });
    }
};

// Staff (Doctor): Discharge a Patient
exports.dischargePatient = async (req, res) => {
    const { hospital_id, ward_id, bed_no } = req.params;

    try {
        const updateRes = await db.query(
            'UPDATE patients SET is_discharged = true, updated_at = NOW() WHERE hospital_id = $1 AND ward_id = $2 AND bed_no = $3 RETURNING *',
            [hospital_id, ward_id, bed_no]
        );

        if (updateRes.rows.length === 0) {
            return res.status(404).json({ message: 'Patient not found or already discharged' });
        }

        res.json({ message: 'Patient discharged successfully', patient: updateRes.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error discharging patient', error: err.message });
    }
};
