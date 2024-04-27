import { Socket } from 'socket.io';
import {userSockets} from '../models/userSockets';


// Función para agregar un socket al mapa
export function addSocket(userId: string, socket: Socket): void {
    userSockets.set(userId, socket);
    console.log(`Socket: ${socket} added for user ${userId}`);
}

// Función para eliminar un socket del mapa
export function removeSocket(userId: string): void {
    userSockets.delete(userId);
    console.log(`Socket removed for user ${userId}`);
}

// Función para obtener un socket del mapa
export function getSocket(userId: string): Socket | undefined {
    return userSockets.get(userId);
}

// Función para obtener el userId a partir de un socket
export function getUserIdFromSocket(socket: Socket): string | undefined {
    for (const [userId, userSocket] of userSockets) {
        if (userSocket === socket) {
            return userId;
        }
    }
    return undefined;
}