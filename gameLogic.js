const { getNextTurn }  = require('./room');
const { getTeammateStatus } = require('./apiQueries');
  
async function handlePlay(io, socketId, playerName, room) {
  try {
    
    const currentFootballer = room['currentFootballer'];
    const teamsUsed = room['teamCounter'];

    if (room['footballersUsed'].includes(playerName)) {
      const errorMessage = `${playerName} has already been used.`;
      return sendInvalidPlayerMesssage(io, room.id, playerName, socketId, errorMessage);
    }

    // Check if players were teammates
    const { wereTheyTeammates, teams } = await getTeammateStatus(playerName, currentFootballer);

    if (!wereTheyTeammates) {
        return sendInvalidPlayerMesssage(io, room.id, playerName, socketId,
            `${playerName} and ${currentFootballer} are not teammates.`);
    }

    const teamsData = {};
    for (let i = 0; i < teams.length; i++) {
      const element = teams[i];

      if (teamsUsed[element] === undefined) {
          teamsUsed[element] = 1;
      } else if (teamsUsed[element] === 3) {
          return sendInvalidPlayerMesssage(io, room.id, playerName, socketId,
              `${element} has already been used 3 times.`);
      } else {
          teamsUsed[element] = teamsUsed[element] + 1;
      }
      teamsData[element] = teamsUsed[element];
    }

    room['currentFootballer'] = playerName;
    const turn = getNextTurn(room, socketId);
    const validPlayerMessageData = getValidPlayerMessageData(playerName, turn, teamsData);
    sendMessageToRoom(io, room.id, 'message', validPlayerMessageData);
    startTimer(io, room);
  } catch (error) {
    console.error('Error sending message and updating turn:', error);
  }
}

function sendInvalidPlayerMesssage(io, roomId, playerName, turn, errorMessage) {
    sendMessageToRoom(io, roomId, 'message', { status: 'InvalidPlay',
     turn, content: errorMessage || `${playerName} is invalid.`});
}

function getValidPlayerMessageData(playerName, turn, teamsData){
  const status = "ValidPlay";
  return { status, content: playerName, turn, teams : teamsData};
}

function startTimer(io, room) {
    clearTimeout(room.timer);
    room.timer = setTimeout(() => {
        console.log('Timer expired');
        sendMessageToRoom(io, room.id, 'message', { status: 'GameOver', content: 'Game Over' });
        clearTimeout(room.timer);
    }, 30000);
}

  
function sendMessageToRoom(io, roomId, event, data) {
  io.to(roomId).emit(event, data);
}
  
module.exports = {
  handlePlay,
  sendMessageToRoom,
};
  