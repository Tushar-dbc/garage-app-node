"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyToken = exports.generateToken = void 0;
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
var _dotenv = _interopRequireDefault(require("dotenv"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
_dotenv["default"].config();
// Generate a JWT token
var generateToken = exports.generateToken = function generateToken(userId, email, name) {
  var secret = process.env.JWT_SECRET;
  var expiresIn = process.env.JWT_EXPIRES_IN || "1h";
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  return _jsonwebtoken["default"].sign({
    userId: userId,
    email: email,
    name: name
  }, secret, {
    expiresIn: expiresIn
  });
};

// Verify a JWT token
var verifyToken = exports.verifyToken = function verifyToken(token) {
  try {
    var secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables.");
    }
    return _jsonwebtoken["default"].verify(token, secret);
  } catch (error) {
    if (error instanceof _jsonwebtoken["default"].TokenExpiredError) {
      throw new Error("Token has expired.");
    } else if (error instanceof _jsonwebtoken["default"].JsonWebTokenError) {
      throw new Error("Invalid token.");
    } else {
      throw new Error("Token verification failed.");
    }
  }
};