"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _supportMultipleEntry = _interopRequireDefault(require("./supportMultipleEntry"));

var _getValidSettings = _interopRequireDefault(require("./getValidSettings"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function main(params) {
  var entries = (0, _getValidSettings.default)(params);
  var addMultiEntry = (0, _supportMultipleEntry.default)(entries);
  return {
    addMultiEntry: addMultiEntry
  };
}

;
var _default = main;
exports.default = _default;
module.exports = main;