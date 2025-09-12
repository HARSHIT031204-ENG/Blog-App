import express from "express"
import {config} from "dotenv"
import dotenv from "dotenv"
import { connection } from "./Database/DB_connection.js"
import router from "./All-Router/Routes.js"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()
app.use(express.json())
dotenv.config()
config({ path: './.env'})

app.use(cors({
    origin: "http://localhost:5173",  
    credentials: true 
}));
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser())
app.use("/api/v1", router)
console.log("Hii Harshit ");
connection()
export default app
