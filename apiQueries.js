async function getTeammateStatus(playerID1, playerID2) {
    try {
        const response = await fetch('http://localhost:8000/teammates', {
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

async function getInternationalTeammateStatus(player1, player2) {
    try {
        const response = await fetch('http://localhost:8000/international-teammates', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ player1, player2 })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error checking international teammates:', error);
        throw error; // Optionally handle or log the error
    }
}

module.exports = { getTeammateStatus, getInternationalTeammateStatus };