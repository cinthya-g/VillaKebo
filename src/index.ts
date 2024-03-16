import express from "express";
import routes from "./routes";
import dotenv from "dotenv";
import './db/db-connector';

dotenv.config();

const app = express();
app.use(express.json());
app.use(routes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running http://localhost:${port}/`);
});