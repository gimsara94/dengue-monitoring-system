const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../db');
const { createLogin } = require('../models/authModel');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Find user in the logins table
        const result = await db.query('SELECT * FROM logins WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Ensure we handle plain text password for the very first admin setup if needed,
        // but normally we use bcrypt. Let's assume passwords will be hashed when created.
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// A helper route just to manually insert an initial admin if the DB is empty
exports.setupInitialAdmin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const check = await db.query('SELECT * FROM logins WHERE role = $1', ['admin']);
        if (check.rows.length > 0) {
            return res.status(400).json({ message: 'Admin already exists' });
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
        console.error('Setup error:', err);
        res.status(500).json({ message: 'Server error setup' });
    }
};
