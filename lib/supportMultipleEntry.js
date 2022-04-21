"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultEntryName = 'main';
var pwd = process.cwd();
var appIndexes = ['js', 'tsx', 'ts', 'jsx'].map(function (ext) {
  return _path.default.resolve(pwd, "src/index.".concat(ext));
});

function _default(entries) {
  return function (config) {
    if (!entries || !entries.length) {
      return config;
    } // Multiple Entry JS


    var defaultEntryHTMLPlugin = config.plugins.filter(function (plugin) {
      return plugin.constructor.name === 'HtmlWebpackPlugin';
    })[0];

    if (defaultEntryHTMLPlugin.options) {
      defaultEntryHTMLPlugin.options.chunks = [defaultEntryName];
    }

    if (defaultEntryHTMLPlugin.userOptions) {
      defaultEntryHTMLPlugin.userOptions.chunks = [defaultEntryName];
    } // config.entry is not an array in Create React App 4


    if (!Array.isArray(config.entry)) {
      config.entry = [config.entry];
    } // If there is only one entry file then it should not be necessary for the rest of the entries


    var necessaryEntry = config.entry.length === 1 ? [] : config.entry.filter(function (file) {
      return !appIndexes.includes(file);
    });
    var multipleEntry = {};
    multipleEntry[defaultEntryName] = config.entry;
    entries.forEach(function (_entry) {
      multipleEntry[_entry.name] = necessaryEntry.concat(_entry.entry); // Multiple Entry HTML Plugin

      config.plugins.push(new defaultEntryHTMLPlugin.constructor(Object.assign({}, defaultEntryHTMLPlugin.options, {
        filename: _entry.outPath,
        template: _entry.template,
        chunks: [_entry.name]
      })));
    });
    config.entry = multipleEntry; // Multiple Entry Output File

    var names = config.output.filename.split('/').reverse();

    if (names[0].indexOf('[name]') === -1) {
      names[0] = '[name].' + names[0];
      config.output.filename = names.reverse().join('/');
    }

    return config;
  };
}