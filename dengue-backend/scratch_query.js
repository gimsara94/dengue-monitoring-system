const db = require('./db');

async function checkData() {
    try {
        const hospital_id = 6;
        const ward_id = 1;
        const patient_id = 2;
        const chart_date = '2026-07-19';

        const labsRes = await db.query(
            'SELECT * FROM chart_labs WHERE hospital_id = $1 AND ward_id = $2 AND patient_id = $3 AND chart_date = $4 ORDER BY chart_time ASC',
            [hospital_id, ward_id, patient_id, chart_date]
        );
        console.log("Labs for 2026-07-19:", JSON.stringify(labsRes.rows, null, 2));
    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        process.exit();
    }
}
checkData();
