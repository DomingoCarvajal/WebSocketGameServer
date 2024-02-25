function sendMessageToRoom(io, room, messageHeader, data, ) {
    io.to(room).emit(messageHeader, data);
    console.log("Message sent to room: ", room);
    console.log("Message: ", data);
}

exports.sendMessageToRoom = sendMessageToRoom;