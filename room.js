function createRoom(id) {
    const currentFootballer = {id : 5044, playerName: 'Kyle Walker'};
    let timer;
    return { 
        id,
        players: [],
        teamCounter: {},
        currentFootballer,
        footballersUsed: [currentFootballer.id],
        timer,
    };
}

function getNextTurn(room, socketId) {
    return room.players[1 - room.players.indexOf(socketId)];
}

module.exports = { createRoom, getNextTurn };