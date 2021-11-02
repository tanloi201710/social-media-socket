const io = require('socket.io')(8080, {
    cors: {
        origin: 'http://localhost:3000'
    }
});

let users = [];

const addUser = (userId,userName,socketId) => {
    !users.some((user) => user.userId === userId) && users.push({ userId, userName, socketId });
}

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId)
}

const getUser = (userId) => {
    return users.find(user => user.userId === userId);
}

io.on('connection', (socket) => {
    console.log("a user connected");
    // add user from client socket
    socket.on('addUser', ({userId, userName}) => {
        addUser(userId,userName,socket.id);
        io.emit('getUsers', users);
    });

    // send and get message
    socket.on('sendMessage', ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        if(user) {
            io.to(user.socketId).emit('getMessage', { senderId, text });
        }
    });

    socket.on('messageNotify', ({ senderId, receiverId }) => {
        const receiverUser = getUser(receiverId);
        const senderUser = getUser(senderId);
        if(receiverUser) {
            io.to(receiverUser.socketId).emit('getMessageNotify', { user: senderUser.userName, userId: senderUser.userId, action: 'đã nhắn tin cho bạn' });
        }
    })

    socket.on('disconnect', () => {
        console.log("a user disconnected");
        removeUser(socket.id);
        io.emit('getUsers', users);
    });
});