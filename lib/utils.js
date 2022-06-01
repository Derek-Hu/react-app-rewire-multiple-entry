"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatName = exports.checkFileExist = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _xxhashjs = _interopRequireDefault(require("xxhashjs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var H = _xxhashjs["default"].h32(0xabcd); // seed = 0xABCD


var formatName = function formatName(name) {
  var omitHash = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  if (!name) {
    name = '';
  }

  var filenamePrefix = name.split('/').reverse()[0].match(/^[^.]*/)[0];

  if (omitHash) {
    return filenamePrefix;
  }

  return filenamePrefix + '.' + H.update(name).digest().toString(16);
};

exports.formatName = formatName;

var checkFileExist = function checkFileExist(file) {
  if (!_fs["default"].existsSync(file)) {
    throw new Error('File not found: ' + file);
  }
};

exports.checkFileExist = checkFileExist;