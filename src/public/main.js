const socket = io();
const {accomplishActivity} = require('../controllers/activityController');


socket.on('login', (data) => handleLogin(socket, data));
socket.on('disconnect', () => handleDisconnect(socket));
socket.on('accomplishActivity', (data) => accomplishActivity);



function handleLogin(socket, token) {
    console.log('Client logged in:', socket.id);
    try {
        const userId = getUserIDFromToken(token);
        if (userId) {
            socket.userId = userId;
            addSocket(userId, socket);
            console.log(`User ${userId} logged in and socket saved.`);
            socket.emit('login_success', { message: 'Logged in successfully.' });
        } else {
            socket.emit('login_error', 'Authentication failed.');
        }
    } catch (error) {
        console.error("Login error:", error);
        socket.emit('login_error', 'Failed to process login.');
    }
}

function handleDisconnect(socket) {
    const userId = getUserIdFromSocket(socket);
    if (userId) {
        removeSocket(userId);
    }
    console.log('Client disconnected:', socket.id);
}