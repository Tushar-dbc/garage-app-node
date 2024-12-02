"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _cors = _interopRequireDefault(require("cors"));
var _bodyParser = _interopRequireDefault(require("body-parser"));
var _userRoutes = _interopRequireDefault(require("./routes/userRoutes"));
var _mongoose = _interopRequireDefault(require("./config/mongoose"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
// src/app.ts

var app = (0, _express["default"])();

// Connect to MongoDB
(0, _mongoose["default"])();

// Middleware for body parsing
app.use(_bodyParser["default"].urlencoded({
  extended: false
}));
app.use(_bodyParser["default"].json());
var whitelist = ["http://localhost:3000", "https://localhost", "https://localhost/", "http://localhost:3001", "http://192.168.1.47:3000"
// Add other URLs as needed
];
var corsOptions = {
  origin: function origin(_origin, callback) {
    console.log("origin", _origin);
    if (!_origin || whitelist.indexOf(_origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};
app.use((0, _cors["default"])(corsOptions));

// CORS Headers
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Headers", "Origin");
  res.header("Access-Control-Allow-Origin", req.header("origin") || "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
  next();
});

// Routes
app.use("/api/users", _userRoutes["default"]);

// Error handling
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});
var _default = exports["default"] = app;