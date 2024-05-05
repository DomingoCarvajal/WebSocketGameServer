const dotenv = require('dotenv');
dotenv.config();
const URL = process.env.PRODUCTION_URL;
async function getTeammateStatus(playerID1, playerID2) {
    try {
        const response = await fetch(URL + '/teammates', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playerID1, playerID2 })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error checking teammates:', error);
        throw error; // Optionally handle or log the error
    }
}

async function getInternationalTeammateStatus(playerID1, playerID2) {
    try {
        const response = await fetch(URL + '/international-teammates', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playerID1, playerID2 })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error checking international teammates:', error);
        throw error; // Optionally handle or log the error
    }
}

module.exports = { getTeammateStatus, getInternationalTeammateStatus };