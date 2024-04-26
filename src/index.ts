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
app.use(express.static(__dirname + '/public'));

// Add the API routes to the Express server and use the Google Auth middleware
googleAuth(app);
app.use(routes);

// Generate Swagger documentation and serve it at the '/api-docs' endpoint
const swaggerDocs = swaggerJSDoc(swaggerConfig);
app.use('/api-docs', serve, setup(swaggerDocs)); // Set up the Swagger-UI-express to serve the generated Swagger docs

// Define the port from the environment or use 3001 by default
const port = process.env.PORT || 3001;

//socket.io
// Create a server using the Express app
const server = app.listen(port, () => {
    console.log(`Server is running http://localhost:${port}/`); // Confirmation the server is running
});

// Create a server using the Express app
const io = new SocketIOServer(server); // Create a new instance of the Socket.io server

// Escuchar conexiones de Socket.IO
io.on('connection', (socket) => {
    console.log('A client connected with socketId:', socket.id);

    socket.on('login', (data,socket) => {
        socket.emit('login',data,socket.id);
    });
    socket.on('accomplishActivity',(data)=>{socket.emit('accomplishActivity',data)});
    socket.on('disconnect', () => socket.emit('disconnect',socket.id));
});

