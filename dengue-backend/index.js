const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json (Electronic data entry)
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded (Manual web forms)

// Routes
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const hospitalAdminRoutes = require('./src/routes/hospitalAdminRoutes');
const wardRoutes = require('./src/routes/wardRoutes');
const staffRoutes = require('./src/routes/staffRoutes');
const chartRoutes = require('./src/routes/chartRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
const nurseRoutes = require('./src/routes/nurseRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hospital', hospitalAdminRoutes);
app.use('/api/ward', wardRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/charts', chartRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/nurse', nurseRoutes);

// Root API Endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Dengue Monitoring System API' });
});

const { initMqtt } = require('./src/services/mqttService');

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
    // Initialize MQTT subscriber
    initMqtt();
});
