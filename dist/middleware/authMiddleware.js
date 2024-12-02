"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyToken = exports.authenticateToken = void 0;
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
// src/middleware/authMiddleware.ts

var verifyToken = exports.verifyToken = function verifyToken(token) {
  return _jsonwebtoken["default"].verify(token, process.env.JWT_SECRET);
};

// Middleware to authenticate token
var authenticateToken = exports.authenticateToken = function authenticateToken(req, res, next) {
  var authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).send({
      error: "Access denied. No token provided."
    });
  }
  var token = authHeader.replace("Bearer ", "");
  try {
    var decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send({
      error: "Invalid token."
    });
  }
};