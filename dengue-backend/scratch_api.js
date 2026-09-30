const axios = require('axios');

async function testFetch() {
    try {
        const res = await axios.get('http://localhost:5001/api/charts/staff/6/1/2?date=2026-07-19', {
            // Need a valid token if there is auth... Wait, there might be auth.
        });
        console.log("Data:", res.data);
    } catch(err) {
        console.log("Error:", err.response ? err.response.data : err.message);
    }
}
testFetch();
