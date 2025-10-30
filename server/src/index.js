// imports + basic setup
import dotenv from "dotenv"

// crucial part for .env
dotenv.config({path: '../.env'})

import cors from "cors"
import mongoose from "mongoose"
import express from "express"
import {registerClient} from "./sse.ts"
const app = express();

const PORT = process.env.PORT || 5050;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

// test

console.log('Port:', process.env.PORT);

// mongodb connecttion

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected !')
    console.log('Database:', mongoose.connection.db.databaseName);})
  .catch((err) => console.error('MongoDB connection error:', err));

// SSE endpoint

let clients = [];

app.get("/api/items/stream",(req,res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  registerClient(res);
})

export function broadcastUpdate(){
  clients.forEach(client => {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  })
}

// routes + route imports
import foodRoutes from "./routes/foods.js"
import recipeRoutes from "./routes/recipes.js"
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import dietRoutes from "./routes/diet.js"
import scrapeRoutes from './routes/scrape.js'

app.use("/api/users",userRoutes);
app.use("/api/recipes",recipeRoutes);
app.use("/api/foods",foodRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/diet",dietRoutes);
app.use("/api/scrape",scrapeRoutes);

// server testing
app.get("/api/test", (req,res) => {
    res.send({message: "Node server is running.."})
});

app.listen(PORT, () => {
    console.log(`server is listening on http://localhost:${PORT}`)
});