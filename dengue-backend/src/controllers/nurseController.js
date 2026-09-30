const db = require('../../db');

// List wards explicitly assigned to this nurse
exports.getAssignedWards = async (req, res) => {
    try {
        const nurse_login_id = req.user.id;

        // The nurse is assigned to a hospital and ward via the 'ward_nurses' table mapped by their nurse_id
        // Let's resolve the nurse record first
        const nurseRes = await db.query(`SELECT id FROM nurses WHERE login_id = $1`, [nurse_login_id]);
        if (nurseRes.rows.length === 0) {
            return res.status(404).json({ message: 'Nurse profile not found for this login.' });
        }

        const nurse_id = nurseRes.rows[0].id;

        const query = `
            SELECT 
                CONCAT(w.hospital_id, '-', w.ward_id) as id,
                w.hospital_id, 
                w.ward_id, 
                CONCAT('Ward ', w.ward_id) as ward_name, 
                h.name as hospital_name
            FROM ward_nurses wn
            JOIN wards w ON wn.hospital_id = w.hospital_id AND wn.ward_id = w.ward_id
            JOIN hospitals h ON w.hospital_id = h.id
            WHERE wn.nurse_id = $1
            ORDER BY h.name, w.ward_id
        `;
        const result = await db.query(query, [nurse_id]);

        res.status(200).json({ data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching assigned wards', error: err.message });
    }
};
