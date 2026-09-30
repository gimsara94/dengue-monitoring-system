const db = require('../../db');

// --- HELPER: Resolve bed_no to patient_id ---
const getPatientIdByBed = async (hospital_id, ward_id, bed_no) => {
    const res = await db.query(
        'SELECT id FROM patients WHERE hospital_id = $1 AND ward_id = $2 AND bed_no = $3 AND is_discharged = false',
        [hospital_id, ward_id, bed_no]
    );
    if (res.rows.length === 0) return null;
    return res.rows[0].id;
};

// --- HELPER: Get Ward details for 'wordmain' role ---
const getWardForLogin = async (login_id) => {
    const res = await db.query('SELECT hospital_id, ward_id FROM wards WHERE login_id = $1', [login_id]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
};

// --- HELPER: Fetch all charts for a specific patient on a specific date ---
const fetchPatientCharts = async (hospital_id, ward_id, patient_id, chart_date) => {
    const vitalsRes = await db.query(
        'SELECT * FROM chart_vitals WHERE hospital_id = $1 AND ward_id = $2 AND patient_id = $3 AND chart_date = $4 ORDER BY chart_time ASC',
        [hospital_id, ward_id, patient_id, chart_date]
    );
    const labsRes = await db.query(
        'SELECT * FROM chart_labs WHERE hospital_id = $1 AND ward_id = $2 AND patient_id = $3 AND chart_date = $4 ORDER BY chart_time ASC',
        [hospital_id, ward_id, patient_id, chart_date]
    );
    const obsRes = await db.query(
        'SELECT * FROM chart_observations WHERE hospital_id = $1 AND ward_id = $2 AND patient_id = $3 AND chart_date = $4 ORDER BY chart_time ASC',
        [hospital_id, ward_id, patient_id, chart_date]
    );
    const volumesRes = await db.query(
        'SELECT * FROM chart_volumes WHERE hospital_id = $1 AND ward_id = $2 AND patient_id = $3 AND chart_date = $4 ORDER BY chart_time ASC',
        [hospital_id, ward_id, patient_id, chart_date]
    );
    const urineRes = await db.query(
        'SELECT * FROM chart_urine WHERE hospital_id = $1 AND ward_id = $2 AND patient_id = $3 AND chart_date = $4 ORDER BY chart_time ASC',
        [hospital_id, ward_id, patient_id, chart_date]
    );

    return {
        vitals: vitalsRes.rows,
        labs: labsRes.rows,
        observations: obsRes.rows,
        volumes: volumesRes.rows,
        urine: urineRes.rows
    };
};

module.exports = {
    getPatientIdByBed,
    getWardForLogin,
    fetchPatientCharts
};
