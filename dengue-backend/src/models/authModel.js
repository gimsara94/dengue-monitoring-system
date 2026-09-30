const bcrypt = require('bcryptjs');

// Helper to create a login
const createLogin = async (client, username, rawPassword, role) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    const result = await client.query(
        'INSERT INTO logins (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
        [username, hash, role]
    );
    return result.rows[0].id;
};

module.exports = {
    createLogin
};
