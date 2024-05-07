import path from "path";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { googleAuth } from './middleware/auth-google-middleware';

//Socket.io
import { Server as SocketIOServer } from 'socket.io'; // Import the Server class from the 'socket.io' module
import routes from "./routes";
import './db/db-connector'; // Ensures database connection on server start
import swaggerJSDoc from 'swagger-jsdoc';
import { serve, setup } from 'swagger-ui-express';
import { swaggerConfig } from './../swagger.config';
import {getUserIDFromToken} from './utils/genToken';
import {setIo} from './utils/io';

const app = express();

// Static routes to public resources
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public', 'views')));

app.use(express.json()); // Parses incoming JSON requests and puts the parsed data in req.body

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
setIo(io); // Set the Socket.io server in the utility function to be accessed from anywhere
// Escuchar conexiones de Socket.IO
io.on('connection', (socket) => {
    console.log('A client connected with socketId:', socket.id);

    socket.on('login',  (token) => {
            console.log('Token received:', token);
            // Verificar el token y extraer el userID
            const userId =  getUserIDFromToken(token); // Esta función debe extraer el userID del token
            //console.log('Desde Onlogin User ID:', userId);
            if (userId) {
                socket.join(userId); // Unirse a la sala correspondiente al userID
                console.log('User joined room:', userId);
        
}});


    //socket.on('RecieveAcomplished',(data)=>{
    //    console.log('Activity accomplished:',data);
    //    socket.emit('AccomplishActivity',data)
    //});

});

