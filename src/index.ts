import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { googleAuth } from './middleware/auth-google-middleware';

import routes from "./routes";
import './db/db-connector'; // Ensures database connection on server start
import swaggerJSDoc from 'swagger-jsdoc';
import { serve, setup } from 'swagger-ui-express';
import { swaggerConfig } from './../swagger.config';

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

// Start the server and listen on the defined port
app.listen(port, () => {
    console.log(`Server is running http://localhost:${port}/`); // Confirmation the server is running
});
