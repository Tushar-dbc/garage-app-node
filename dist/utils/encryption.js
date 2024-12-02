"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decryptData = void 0;
var _cryptoJs = _interopRequireDefault(require("crypto-js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
// Decrypt data
var decryptData = exports.decryptData = function decryptData(cipherText) {
  var bytes = _cryptoJs["default"].AES.decrypt(cipherText, process.env.CRYPTO_ENCRYPTION_KEY || "");
  return bytes.toString(_cryptoJs["default"].enc.Utf8);
};