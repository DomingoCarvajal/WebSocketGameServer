const { getNextTurn }  = require('./room');
const { getTeammateStatus, getInternationalTeammateStatus } = require('./apiQueries');
  
async function getRealTeammateStatus(playerID1, playerID2) {
  let normal_response;
  let international_response;
  try {
    normal_response = await getTeammateStatus(playerID1, playerID2);
  } catch (error) {
    console.error('Error checking teammates:', error);
    throw error; // Optionally handle or log the error
  }

  try {
    international_response = await getInternationalTeammateStatus(playerID1, playerID2);
  } catch (error) {
    console.error('Error checking international teammates:', error);
    throw error; // Optionally handle or log the error
  }

  response = { teams: normal_response.teams.concat(international_response.teams), 
  wereTheyTeammates: normal_response.wereTheyTeammates || international_response.wereTheyTeammates };

  console.log('Response:', response);

  return response;
}

async function handlePlay(io, socketId, player, room) {
  try {
    
    const playerID = player.id;
    const playerName = player.playerName;
    const currentFootballer = room['currentFootballer'];
    const teamsUsed = room['teamCounter'];

    if (room['footballersUsed'].includes(player.id)) {
      const errorMessage = `${playerName} has already been used.`;
      return sendInvalidPlayerMesssage(io, room.id, playerName, socketId, errorMessage);
    }
    // Check if players were teammates
    const { wereTheyTeammates, teams } = await getRealTeammateStatus(playerID, currentFootballer.id);

    if (!wereTheyTeammates) {
        return sendInvalidPlayerMesssage(io, room.id, playerName, socketId,
            `${playerName} and ${currentFootballer.playerName} are not teammates.`);
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

    room['currentFootballer'] = player;
    room['footballersUsed'].push(player.id);
    console.log('Footballers used:', room['footballersUsed'])
    const turn = getNextTurn(room, socketId);
    const validPlayerMessageData = getValidPlayerMessageData(playerName, turn, teamsData);
    sendMessageToRoom(io, room.id, 'message', validPlayerMessageData);
    startTimer(io, room, turn);
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

function startTimer(io, room, turn) {
    clearTimeout(room.timer);
    room.timer = setTimeout(() => {
        console.log('Timer expired');
        sendMessageToRoom(io, room.id, 'message', { status: 'GameOver', content: turn});
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
  