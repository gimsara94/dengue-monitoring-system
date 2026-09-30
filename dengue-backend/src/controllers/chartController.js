const db = require('../../db');

const { getPatientIdByBed, getWardForLogin, fetchPatientCharts } = require('../models/chartModel');

// --- UPSERT HELPERS ---
const upsertVitals = async (hospital_id, ward_id, patient_id, chart_date, chart_time, body, user_id) => {
    const { pr_min, bp_supine_sys, bp_supine_dia, pulse_pressure, bp_sitting_sys, bp_sitting_dia, crft, rr_min } = body;
    const existing = await db.query(
        `SELECT id FROM chart_vitals WHERE patient_id = $1 AND chart_date = COALESCE($2::date, CURRENT_DATE) AND chart_time = COALESCE($3::time, LOCALTIME)`,
        [patient_id, chart_date, chart_time]
    );

    if (existing.rows.length > 0) {
        const updateParams = [];
        const updateValues = [existing.rows[0].id, user_id];
        let idx = 3;

        const addParam = (col, val) => {
            if (val !== undefined && val !== null) {
                updateParams.push(`${col} = $${idx}`);
                updateValues.push(val);
                idx++;
            }
        };

        addParam('pr_min', pr_min);
        addParam('bp_supine_sys', bp_supine_sys);
        addParam('bp_supine_dia', bp_supine_dia);
        addParam('pulse_pressure', pulse_pressure);
        addParam('bp_sitting_sys', bp_sitting_sys);
        addParam('bp_sitting_dia', bp_sitting_dia);
        addParam('crft', crft);
        addParam('rr_min', rr_min);

        if (updateParams.length > 0) {
            const res = await db.query(
                `UPDATE chart_vitals SET ${updateParams.join(', ')}, recorded_at = NOW(), recorded_by = $2 WHERE id = $1 RETURNING *`,
                updateValues
            );
            return res.rows[0];
        }
        return (await db.query(`SELECT * FROM chart_vitals WHERE id = $1`, [existing.rows[0].id])).rows[0];
    } else {
        const res = await db.query(
            `INSERT INTO chart_vitals 
             (hospital_id, ward_id, patient_id, chart_date, chart_time, pr_min, bp_supine_sys, bp_supine_dia, pulse_pressure, bp_sitting_sys, bp_sitting_dia, crft, rr_min, recorded_by) 
             VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), COALESCE($5::time, LOCALTIME), $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
            [hospital_id, ward_id, patient_id, chart_date, chart_time, pr_min, bp_supine_sys, bp_supine_dia, pulse_pressure, bp_sitting_sys, bp_sitting_dia, crft, rr_min, user_id]
        );
        return res.rows[0];
    }
};

const upsertLabs = async (hospital_id, ward_id, patient_id, chart_date, chart_time, body, user_id) => {
    const { pcv_percentage, plt_count, wbc_total } = body;
    const existing = await db.query(
        `SELECT id FROM chart_labs WHERE patient_id = $1 AND chart_date = COALESCE($2::date, CURRENT_DATE) AND chart_time = COALESCE($3::time, LOCALTIME)`,
        [patient_id, chart_date, chart_time]
    );

    if (existing.rows.length > 0) {
        const updateParams = [];
        const updateValues = [existing.rows[0].id, user_id];
        let idx = 3;

        const addParam = (col, val) => {
            if (val !== undefined && val !== null) {
                updateParams.push(`${col} = $${idx}`);
                updateValues.push(val);
                idx++;
            }
        };

        addParam('pcv_percentage', pcv_percentage);
        addParam('plt_count', plt_count);
        addParam('wbc_total', wbc_total);

        if (updateParams.length > 0) {
            const res = await db.query(
                `UPDATE chart_labs SET ${updateParams.join(', ')}, recorded_at = NOW(), recorded_by = $2 WHERE id = $1 RETURNING *`,
                updateValues
            );
            return res.rows[0];
        }
        return (await db.query(`SELECT * FROM chart_labs WHERE id = $1`, [existing.rows[0].id])).rows[0];
    } else {
        const res = await db.query(
            `INSERT INTO chart_labs 
             (hospital_id, ward_id, patient_id, chart_date, chart_time, pcv_percentage, plt_count, wbc_total, recorded_by) 
             VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), COALESCE($5::time, LOCALTIME), $6, $7, $8, $9) RETURNING *`,
            [hospital_id, ward_id, patient_id, chart_date, chart_time, pcv_percentage, plt_count, wbc_total, user_id]
        );
        return res.rows[0];
    }
};

const upsertObs = async (hospital_id, ward_id, patient_id, chart_date, chart_time, body, user_id) => {
    const { observation_text } = body;
    const existing = await db.query(
        `SELECT id FROM chart_observations WHERE patient_id = $1 AND chart_date = COALESCE($2::date, CURRENT_DATE) AND chart_time = COALESCE($3::time, LOCALTIME)`,
        [patient_id, chart_date, chart_time]
    );

    if (existing.rows.length > 0) {
        if (observation_text !== undefined && observation_text !== null) {
            const res = await db.query(
                `UPDATE chart_observations SET observation_text = $3, recorded_at = NOW(), recorded_by = $2 WHERE id = $1 RETURNING *`,
                [existing.rows[0].id, user_id, observation_text]
            );
            return res.rows[0];
        }
        return (await db.query(`SELECT * FROM chart_observations WHERE id = $1`, [existing.rows[0].id])).rows[0];
    } else {
        const res = await db.query(
            `INSERT INTO chart_observations 
             (hospital_id, ward_id, patient_id, chart_date, chart_time, observation_text, recorded_by) 
             VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), COALESCE($5::time, LOCALTIME), $6, $7) RETURNING *`,
            [hospital_id, ward_id, patient_id, chart_date, chart_time, observation_text, user_id]
        );
        return res.rows[0];
    }
};

const upsertVolumes = async (hospital_id, ward_id, patient_id, chart_date, chart_time, body, user_id) => {
    const { oral_ml, n_saline_ml, dextran_40_ml, tetrastarch_ml, blood_ml, other_ml } = body;
    const existing = await db.query(
        `SELECT id FROM chart_volumes WHERE patient_id = $1 AND chart_date = COALESCE($2::date, CURRENT_DATE) AND chart_time = COALESCE($3::time, LOCALTIME)`,
        [patient_id, chart_date, chart_time]
    );

    if (existing.rows.length > 0) {
        const updateParams = [];
        const updateValues = [existing.rows[0].id, user_id];
        let idx = 3;

        const addParam = (col, val) => {
            if (val !== undefined && val !== null && val !== '') {
                updateParams.push(`${col} = $${idx}`);
                updateValues.push(val);
                idx++;
            }
        };

        addParam('oral_ml', oral_ml);
        addParam('n_saline_ml', n_saline_ml);
        addParam('dextran_40_ml', dextran_40_ml);
        addParam('tetrastarch_ml', tetrastarch_ml);
        addParam('blood_ml', blood_ml);
        addParam('other_ml', other_ml);

        if (updateParams.length > 0) {
            const res = await db.query(
                `UPDATE chart_volumes SET ${updateParams.join(', ')}, recorded_at = NOW(), recorded_by = $2 WHERE id = $1 RETURNING *`,
                updateValues
            );
            return res.rows[0];
        }
        return (await db.query(`SELECT * FROM chart_volumes WHERE id = $1`, [existing.rows[0].id])).rows[0];
    } else {
        const res = await db.query(
            `INSERT INTO chart_volumes 
             (hospital_id, ward_id, patient_id, chart_date, chart_time, oral_ml, n_saline_ml, dextran_40_ml, tetrastarch_ml, blood_ml, other_ml, recorded_by) 
             VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), COALESCE($5::time, LOCALTIME), $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [hospital_id, ward_id, patient_id, chart_date, chart_time,
                oral_ml || 0, n_saline_ml || 0, dextran_40_ml || 0, tetrastarch_ml || 0, blood_ml || 0, other_ml || 0, user_id]
        );
        return res.rows[0];
    }
};

const upsertUrine = async (hospital_id, ward_id, patient_id, chart_date, chart_time, body, user_id) => {
    const { urine_ml, hour } = body;
    // For urine, we uniquely identify a record by patient, date, and hour
    const existing = await db.query(
        `SELECT id FROM chart_urine WHERE patient_id = $1 AND chart_date = COALESCE($2::date, CURRENT_DATE) AND hour = $3`,
        [patient_id, chart_date, hour]
    );

    if (existing.rows.length > 0) {
        const res = await db.query(
            `UPDATE chart_urine SET urine_ml = $1, chart_time = COALESCE($4::time, LOCALTIME), recorded_at = NOW(), recorded_by = $2 WHERE id = $3 RETURNING *`,
            [urine_ml, user_id, existing.rows[0].id, chart_time]
        );
        return res.rows[0];
    } else {
        const res = await db.query(
            `INSERT INTO chart_urine 
             (hospital_id, ward_id, patient_id, chart_date, chart_time, hour, urine_ml, recorded_by) 
             VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), COALESCE($5::time, LOCALTIME), $6, $7, $8) RETURNING *`,
            [hospital_id, ward_id, patient_id, chart_date, chart_time, hour, urine_ml, user_id]
        );
        return res.rows[0];
    }
};

// ==========================================================
// WARD ENDPOINTS (hospital_id & ward_id deduced from token)
// ==========================================================

exports.addWardVitals = async (req, res) => {
    const { bed_no } = req.params;
    const chart_date = req.body.chart_date || null;
    const chart_time = req.body.chart_time || null;
    try {
        const ward = await getWardForLogin(req.user.id);
        if (!ward) return res.status(403).json({ message: 'No ward associated with this login' });

        const patient_id = await getPatientIdByBed(ward.hospital_id, ward.ward_id, bed_no);
        if (!patient_id) return res.status(404).json({ message: 'No active patient found in this bed' });

        const data = await upsertVitals(ward.hospital_id, ward.ward_id, patient_id, chart_date, chart_time, req.body, req.user.id);
        res.status(201).json({ message: 'Vitals recorded successfully', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error recording vitals', error: err.message });
    }
};

exports.addWardLabs = async (req, res) => {
    const { bed_no } = req.params;
    const chart_date = req.body.chart_date || null;
    const chart_time = req.body.chart_time || null;
    try {
        const ward = await getWardForLogin(req.user.id);
        if (!ward) return res.status(403).json({ message: 'No ward associated with this login' });

        const patient_id = await getPatientIdByBed(ward.hospital_id, ward.ward_id, bed_no);
        if (!patient_id) return res.status(404).json({ message: 'No active patient found in this bed' });

        const data = await upsertLabs(ward.hospital_id, ward.ward_id, patient_id, chart_date, chart_time, req.body, req.user.id);
        res.status(201).json({ message: 'Labs recorded successfully', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error recording labs', error: err.message });
    }
};

exports.addWardObservations = async (req, res) => {
    const { bed_no } = req.params;
    const chart_date = req.body.chart_date || null;
    const chart_time = req.body.chart_time || null;
    try {
        const ward = await getWardForLogin(req.user.id);
        if (!ward) return res.status(403).json({ message: 'No ward associated with this login' });

        const patient_id = await getPatientIdByBed(ward.hospital_id, ward.ward_id, bed_no);
        if (!patient_id) return res.status(404).json({ message: 'No active patient found in this bed' });

        const data = await upsertObs(ward.hospital_id, ward.ward_id, patient_id, chart_date, chart_time, req.body, req.user.id);
        res.status(201).json({ message: 'Observation recorded successfully', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error recording observation', error: err.message });
    }
};

exports.addWardVolumes = async (req, res) => {
    const { bed_no } = req.params;
    const chart_date = req.body.chart_date || null;
    const chart_time = req.body.chart_time || null;
    try {
        const ward = await getWardForLogin(req.user.id);
        if (!ward) return res.status(403).json({ message: 'No ward associated with this login' });

        const patient_id = await getPatientIdByBed(ward.hospital_id, ward.ward_id, bed_no);
        if (!patient_id) return res.status(404).json({ message: 'No active patient found in this bed' });

        const data = await upsertVolumes(ward.hospital_id, ward.ward_id, patient_id, chart_date, chart_time, req.body, req.user.id);
        res.status(201).json({ message: 'Volumes recorded successfully', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error recording volumes', error: err.message });
    }
};

exports.addWardUrine = async (req, res) => {
    const { bed_no } = req.params;
    const chart_date = req.body.chart_date || null;
    const chart_time = req.body.chart_time || null;
    try {
        const ward = await getWardForLogin(req.user.id);
        if (!ward) return res.status(403).json({ message: 'No ward associated with this login' });

        const patient_id = await getPatientIdByBed(ward.hospital_id, ward.ward_id, bed_no);
        if (!patient_id) return res.status(404).json({ message: 'No active patient found in this bed' });

        const data = await upsertUrine(ward.hospital_id, ward.ward_id, patient_id, chart_date, chart_time, req.body, req.user.id);
        res.status(201).json({ message: 'Urine recorded successfully', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error recording urine', error: err.message });
    }
};

exports.getWardPatientCharts = async (req, res) => {
    const { bed_no } = req.params;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    try {
        const ward = await getWardForLogin(req.user.id);
        if (!ward) return res.status(403).json({ message: 'No ward associated with this login' });

        const patient_id = await getPatientIdByBed(ward.hospital_id, ward.ward_id, bed_no);
        if (!patient_id) return res.status(404).json({ message: 'No active patient found in this bed' });

        const charts = await fetchPatientCharts(ward.hospital_id, ward.ward_id, patient_id, date);
        res.status(200).json({ date, data: charts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching charts', error: err.message });
    }
};


// ==========================================================
// STAFF ENDPOINTS (hospital_id & ward_id from URL params)
// ==========================================================

exports.addStaffVitals = async (req, res) => {
    const { hospital_id, ward_id, bed_no } = req.params;
    const chart_date = req.body.chart_date || null;
    const chart_time = req.body.chart_time || null;

    try {
        const patient_id = await getPatientIdByBed(hospital_id, ward_id, bed_no);
        if (!patient_id) return res.status(404).json({ message: 'No active patient found in this bed' });

        const data = await upsertVitals(hospital_id, ward_id, patient_id, chart_date, chart_time, req.body, req.user.id);
        res.status(201).json({ message: 'Vitals recorded successfully', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error recording vitals', error: err.message });
    }
};

exports.addStaffLabs = async (req, res) => {
    const { hospital_id, ward_id, bed_no } = req.params;
    const chart_date = req.body.chart_date || null;
    const chart_time = req.body.chart_time || null;

    try {
        const patient_id = await getPatientIdByBed(hospital_id, ward_id, bed_no);
        if (!patient_id) return res.status(404).json({ message: 'No active patient found in this bed' });

        const data = await upsertLabs(hospital_id, ward_id, patient_id, chart_date, chart_time, req.body, req.user.id);
        res.status(201).json({ message: 'Labs recorded successfully', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error recording labs', error: err.message });
    }
};

exports.addStaffObservations = async (req, res) => {
    const { hospital_id, ward_id, bed_no } = req.params;
    const chart_date = req.body.chart_date || null;
    const chart_time = req.body.chart_time || null;

    try {
        const patient_id = await getPatientIdByBed(hospital_id, ward_id, bed_no);
        if (!patient_id) return res.status(404).json({ message: 'No active patient found in this bed' });

        const data = await upsertObs(hospital_id, ward_id, patient_id, chart_date, chart_time, req.body, req.user.id);
        res.status(201).json({ message: 'Observation recorded successfully', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error recording observation', error: err.message });
    }
};

exports.addStaffVolumes = async (req, res) => {
    const { hospital_id, ward_id, bed_no } = req.params;
    const chart_date = req.body.chart_date || null;
    const chart_time = req.body.chart_time || null;

    try {
        const patient_id = await getPatientIdByBed(hospital_id, ward_id, bed_no);
        if (!patient_id) return res.status(404).json({ message: 'No active patient found in this bed' });

        const data = await upsertVolumes(hospital_id, ward_id, patient_id, chart_date, chart_time, req.body, req.user.id);
        res.status(201).json({ message: 'Volumes recorded successfully', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error recording volumes', error: err.message });
    }
};

exports.addStaffUrine = async (req, res) => {
    const { hospital_id, ward_id, bed_no } = req.params;
    const chart_date = req.body.chart_date || null;
    const chart_time = req.body.chart_time || null;

    try {
        const patient_id = await getPatientIdByBed(hospital_id, ward_id, bed_no);
        if (!patient_id) return res.status(404).json({ message: 'No active patient found in this bed' });

        const data = await upsertUrine(hospital_id, ward_id, patient_id, chart_date, chart_time, req.body, req.user.id);
        res.status(201).json({ message: 'Urine recorded successfully', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error recording urine', error: err.message });
    }
};

exports.getStaffPatientCharts = async (req, res) => {
    const { hospital_id, ward_id, bed_no } = req.params;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    try {
        const patient_id = await getPatientIdByBed(hospital_id, ward_id, bed_no);
        if (!patient_id) return res.status(404).json({ message: 'No active patient found in this bed' });

        const charts = await fetchPatientCharts(hospital_id, ward_id, patient_id, date);
        res.status(200).json({ date, data: charts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching charts', error: err.message });
    }
};
