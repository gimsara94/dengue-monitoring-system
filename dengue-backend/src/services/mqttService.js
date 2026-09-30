const mqtt = require('mqtt');
const db = require('../../db');

const initMqtt = () => {
    // Read the broker URL from the environment or fallback to localhost
    const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
    console.log(`Connecting to MQTT Broker at ${brokerUrl}...`);
    
    const client = mqtt.connect(brokerUrl);

    client.on('connect', () => {
        console.log('Connected to MQTT Broker.');
        
        // Subscribe to urine vitals for all hospitals, wards, and patients
        // + is a single-level wildcard in MQTT
        const topic = 'vitals/hospital/+/ward/+/patient/+/urine';
        
        client.subscribe(topic, (err) => {
            if (!err) {
                console.log(`Subscribed to MQTT topic: ${topic}`);
            } else {
                console.error('MQTT Subscription error:', err);
            }
        });
    });

    client.on('message', async (topic, message) => {
        try {
            console.log(`Received message on ${topic}: ${message.toString()}`);
            
            // Expected topic: vitals/hospital/6/ward/1/patient/2/urine
            const parts = topic.split('/');
            if (parts.length === 8 && parts[0] === 'vitals' && parts[7] === 'urine') {
                const hospitalId = parseInt(parts[2], 10);
                const wardId = parseInt(parts[4], 10);
                const patientId = parseInt(parts[6], 10);

                // Expected payload: {"hour_end": "15:00", "urine_volume_ml": 85.5}
                const payload = JSON.parse(message.toString());
                const hourEnd = payload.hour_end; // e.g., "15:00"
                const urineVolumeMl = Math.round(payload.urine_volume_ml); // DB schema expects integer

                // Use the server's current date and time for the chart
                const now = new Date();
                const chartDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
                const chartTime = now.toTimeString().split(' ')[0]; // HH:MM:SS

                // Insert into DB
                const query = `
                    INSERT INTO chart_urine 
                    (hospital_id, ward_id, patient_id, hour, urine_ml, chart_date, chart_time) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7) 
                    RETURNING id;
                `;
                const values = [hospitalId, wardId, patientId, hourEnd, urineVolumeMl, chartDate, chartTime];
                
                const result = await db.query(query, values);
                console.log(`Saved urine data for patient ${patientId} (Record ID: ${result.rows[0].id})`);
            }
        } catch (error) {
            console.error('Error processing MQTT message:', error.message);
        }
    });

    let connectionErrorLogged = false;
    client.on('error', (err) => {
        if (!connectionErrorLogged) {
            console.error(`MQTT Client Error: Failed to connect to broker at ${brokerUrl}. It will keep trying silently in the background.`);
            connectionErrorLogged = true;
        }
    });
};

module.exports = { initMqtt };
