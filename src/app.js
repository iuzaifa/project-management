import express from "express";
import cors from "cors";
import healthCheckRouter from "./routes/healthCheck.routes.js"

// basic configuration
const app = express();
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// both test only 
app.get("/", (req, res) => {res.send("Hello app!");});// test only
app.get("/insta", (req, res) => {res.send("hello insta!");}); // test only 

app.use("/api/v1/healthcheck", healthCheckRouter)


export default app;
