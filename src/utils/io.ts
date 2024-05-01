import {Server as SocketIOServer} from 'socket.io'; // Import the Server class from the 'socket.io' module

let io:SocketIOServer =null;

export function getIo(){
    return io;
}
export function setIo(newIo: SocketIOServer) {
    
    io = newIo;
}
