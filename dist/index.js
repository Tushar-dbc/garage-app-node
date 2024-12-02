"use strict";

var _http = _interopRequireDefault(require("http"));
var _socket = require("socket.io");
var _app = _interopRequireDefault(require("./app"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
// Your Express app

var port = process.env.PORT || 5001;

// Create HTTP server
var server = _http["default"].createServer(_app["default"]);

// Initialize Socket.IO
var io = new _socket.Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "https://localhost", "https://localhost/", "http://localhost:5173", "http://192.168.1.47:5001", "http://192.168.1.47:3000", "http://192.168.1.47:5173", "https://c0cd-2402-a00-402-77bf-9d2c-3db6-1069-9b79.ngrok-free.app"],
    credentials: true
  }
});

// Set up socket connection event
io.on("connection", function (socket) {
  console.log("A user connected");

  // Example event
  socket.on("disconnect", function () {
    console.log("User disconnected");
  });
});

// Start the server
server.listen(port, function () {
  console.log("Server is running on port ".concat(port));
});