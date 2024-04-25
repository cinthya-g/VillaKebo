import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken'; // Asumiendo que estás usando JWT

const secret = process.env.JWT_SECRET; // Asegúrate de tener tu secreto de JWT disponible

export function getUserIdFromSocket(socket: Socket): string | null {
    try {
        const token = socket.handshake.query.token; // Suponiendo que el token se pasa como un query parameter
        if (!token) return null;
         const tokString=token.toString();

        const decoded = jwt.verify(tokString, secret) as jwt.JwtPayload; // Verifica y decodifica el token
        return decoded.userId; // Asumiendo que el payload del token contiene el userId
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
}
