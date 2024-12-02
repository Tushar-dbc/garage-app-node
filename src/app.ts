// src/app.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import connectDB from "./config/mongoose";
import userRoutes from "./routes/userRoutes";
import invoiceRoutes from "./routes/invoiceRoute";

const app = express();

connectDB();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const whitelist = [
    "http://localhost:3000",
    "https://localhost",
    "https://localhost/",
    "http://localhost:3001",
    "http://192.168.1.47:3000",
];

const corsOptions = {
    origin: function (origin: string | undefined, callback: any) {
        console.log("origin", origin);
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));

app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Headers", "Origin");
    res.header("Access-Control-Allow-Origin", req.header("origin") || "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    next();
});

app.use("/api/users", userRoutes);
app.use("/api/invoice", invoiceRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message,
        },
    });
});

export default app;
