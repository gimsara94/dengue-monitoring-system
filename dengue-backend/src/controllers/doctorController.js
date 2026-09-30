const db = require('../../db');

// List wards explicitly assigned to this doctor
exports.getAssignedWards = async (req, res) => {
    try {
        const doctor_login_id = req.user.id;

        // The doctor is assigned to a hospital and ward via the 'doctors' table mapped by login_id
        // However, looking at earlier migrations, a doctor might be linked directly to multiple
        // Let's resolve the doctor record first
        const docRes = await db.query(`SELECT id FROM doctors WHERE login_id = $1`, [doctor_login_id]);
        if (docRes.rows.length === 0) {
            return res.status(404).json({ message: 'Doctor profile not found for this login.' });
        }

        const doctor_id = docRes.rows[0].id;

        const query = `
            SELECT 
                CONCAT(w.hospital_id, '-', w.ward_id) as id,
                w.hospital_id, 
                w.ward_id, 
                CONCAT('Ward ', w.ward_id) as ward_name, 
                h.name as hospital_name
            FROM ward_doctors dw
            JOIN wards w ON dw.hospital_id = w.hospital_id AND dw.ward_id = w.ward_id
            JOIN hospitals h ON w.hospital_id = h.id
            WHERE dw.doctor_id = $1
            ORDER BY h.name, w.ward_id
        `;
        const result = await db.query(query, [doctor_id]);

        res.status(200).json({ data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching assigned wards', error: err.message });
    }
};
