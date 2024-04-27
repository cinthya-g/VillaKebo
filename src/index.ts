import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { googleAuth } from './middleware/auth-google-middleware';

import { Server as SocketIOServer } from 'socket.io';

import routes from "./routes";
import './db/db-connector'; // Ensures database connection on server start
import swaggerJSDoc from 'swagger-jsdoc';
import { serve, setup } from 'swagger-ui-express';
import { swaggerConfig } from './../swagger.config';

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

// Start the server and listen on the defined port
const server = app.listen(port, () => {
    console.log(`Server is running http://localhost:${port}/`); // Confirmation the server is running
});

const socketMap = new Map();
const io = new SocketIOServer(server);

io.on('connection', (socket) => {
    console.log('io Alive')
    socket.on('ownerRegistered', (ownerId) => {
        socketMap.set(ownerId, socket);
    });

    socket.on('activityAccomplished', (ownerId) => {
        const ownerSocket = socketMap.get(ownerId);
        if(ownerSocket) {
            ownerSocket.emit('notifyOwner', 'Activity Accomplished!');
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});