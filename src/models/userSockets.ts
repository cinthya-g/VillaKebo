import { Socket } from 'socket.io';

declare module 'socket.io' {
    interface Socket {
        userId?: string;  // Haciendo 'userId' opcional para manejar casos donde aún no se ha asignado
    }
}
// Crear un mapa para mantener la relación entre userId y su socket correspondiente
export const userSockets = new Map<string, Socket>();



