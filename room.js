function createRoom(id) {
    const currentFootballer = 'Kyle Walker';
    let timer;
    return { 
        id,
        players: [],
        teamCounter: {},
        currentFootballer,
        footballersUsed: [currentFootballer],
        timer,
    };
}

function getNextTurn(room, socketId) {
    return room.players[1 - room.players.indexOf(socketId)];
}

module.exports = { createRoom, getNextTurn };