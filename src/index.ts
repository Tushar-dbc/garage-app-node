import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";

const port = process.env.PORT || 5001;

const server = http.createServer(app);

const io = new SocketIOServer(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "http://localhost:3001",
            "https://localhost",
            "https://localhost/",
            "http://192.168.1.47:3000",
            "https://7aaa-2402-a00-402-77bf-bead-74ea-95e0-d124.ngrok-free.app",
        ],
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
