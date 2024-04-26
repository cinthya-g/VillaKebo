import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { googleAuth } from './middleware/auth-google-middleware';

//Socket.io
import { createServer } from 'http'; // Import the createServer function from the 'http' module
import { Server as SocketIOServer } from 'socket.io'; // Import the Server class from the 'socket.io' module
import { addSocket, getUserIdFromSocket, removeSocket } from './utils/userSockets'; // Import the addSocket and removeSocket functions from the 'userSockets' module

import routes from "./routes";
import './db/db-connector'; // Ensures database connection on server start
import swaggerJSDoc from 'swagger-jsdoc';
import { serve, setup } from 'swagger-ui-express';
import { swaggerConfig } from './../swagger.config';
import {getUserIDFromToken} from './utils/genToken';



const app = express();
app.use(express.json()); // Parses incoming JSON requests and puts the parsed data in req.body

// Add the API routes to the Express server and use the Google Auth middleware
googleAuth(app);
app.use(routes);

// Generate Swagger documentation and serve it at the '/api-docs' endpoint
const swaggerDocs = swaggerJSDoc(swaggerConfig);
app.use('/api-docs', serve, setup(swaggerDocs)); // Set up the Swagger-UI-express to serve the generated Swagger docs

// Define the port from the environment or use 3001 by default
const port = process.env.PORT || 3001;



//#######################################################################
//socket.io
// Create a server using the Express app
const server = app.listen(port, () => {
    console.log(`Server is running http://localhost:${port}/`); // Confirmation the server is running
});

// Create a server using the Express app
const io = new SocketIOServer(server); // Create a new instance of the Socket.io server

// Escuchar conexiones de Socket.IO
io.on('connection', (socket) => {
    console.log('A client connected with id:', socket.id);

    socket.on('login', async (token) => {
        try {
            const userId = getUserIDFromToken(token); // Función para extraer el userID del token
            if (userId) {
                socket.userId = userId; // Almacenar el userID en el objeto socket
                addSocket(userId, socket); // Opcional, si aún deseas usar el mapa
                console.log(`User ${userId} logged in and socket saved.`);
                socket.emit('login_success', { message: 'Logged in successfully.' });
            } else {
                socket.emit('login_error', 'Authentication failed.');
            }
        } catch (error) {
            console.error("Login error:", error);
            socket.emit('login_error', 'Failed to process login.');
        }
    });

    //On login event
    //Aqui voy a tener que disparar un evento para que cunado se haga login se 
    //actualice la lista de usuarios con sus sockets, para eso usar jwt para decodificar el token
    //y enviar el id del usuario

    // Manejar desconexiones
    socket.on('disconnect', () => {
        // Aquí necesitarías alguna forma de obtener el userId desde el socket antes de desconectar
        const userId = getUserIdFromSocket(socket); // Asumiendo que esta función puede manejar desconexiones
        if (userId) {
            removeSocket(userId);
        }
        console.log('Client disconnected:', socket.id);
    });
});
//#######################################################################
