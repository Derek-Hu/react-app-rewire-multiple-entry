'use strict';

const path = require('path');
const pwd = process.cwd();
const XXH = require('xxhashjs');
const paths = require('react-app-rewired/scripts/utils/paths.js');

var H = XXH.h32(0xABCD) // seed = 0xABCD

const formatName = function (name) {
  return name.split('/').reverse()[0].match(/^[^.]*/)[0] + '.' + H.update(name).digest().toString(16);
};

module.exports = function (params) {
  // Prepare Data for Multiple Entry
  const entries = params.map(function (entry) {
    if (!entry.entry) {
      throw new Error('Expect attribute [entry] used for entry JS file!');
    }
    if (!entry.template) {
      entry.template = paths.appHtml;
    } else {
      entry.template = path.resolve(pwd, entry.template);
    }
    if (!entry.outPath) {
      entry.outPath = path.relative(pwd, entry.template).replace(/\\/g, '/')
      console.log(entry.outPath)
    }
    entry.outPath = entry.outPath.replace(/^\//, '').replace(/\/$/, '');
    console.log(entry.outPath)
    return {
      name: formatName(entry.entry),
      entry: path.resolve(pwd, entry.entry),
      template: entry.template,
      outPath: entry.outPath,
      proxyPath: '/build/' + entry.outPath,
      pattern: new RegExp('^' + entry.outPath.replace(/[-/\\^$&*+?.()|[\]{}]/g, '\\$&')),
    }
  });

  console.log(entries)
  return {
    addEntryProxy: function (configFunction) {
      if (!configFunction.historyApiFallback) {
        configFunction.historyApiFallback = {};
      }

      if (!configFunction.historyApiFallback.rewrites) {
        configFunction.historyApiFallback.rewrites = [];
      }

      configFunction.historyApiFallback.rewrites = configFunction.historyApiFallback.rewrites.concat(entries.map(function (entry) {
        return {
          from: entry.pattern,
          to: entry.proxyPath
        };
      }));

      return configFunction;
    },
    addMultiEntry: function (config) {
      // Mulitple Entry JS
      const defaultEntryPath = 'src/index.js';
      const defaulEntryName = formatName(defaultEntryPath);
      const defaultEntryHTMLPlugin = config.plugins.filter(
        plugin => plugin.constructor.name === 'HtmlWebpackPlugin'
      )[0];
      defaultEntryHTMLPlugin.options.chunks = [defaulEntryName];
      const necessaryEntry = config.entry.filter(file => {
        return file !== paths.appIndexJs;
      });

      const multipleEntry = {};
      multipleEntry[defaulEntryName] = config.entry;

      entries.forEach(_entry => {
        multipleEntry[_entry.name] = necessaryEntry.concat(_entry.entry);
        // Multiple Entry HTML Plugin
        config.plugins.push(
          new defaultEntryHTMLPlugin.constructor(
            Object.assign({}, defaultEntryHTMLPlugin.options, {
              filename: _entry.outPath,
              template: _entry.template,
              chunks: [_entry.name]
            })
          )
        );
      });

      config.entry = multipleEntry;

      // Multiple Entry Output File
      let names = config.output.filename.split('/').reverse();

      if (names[0].indexOf('[name]') === -1) {
        names[0] = '[name].' + names[0];
        config.output.filename = names.reverse().join('/');
      }
      console.log(config.entry)
      console.log(config.output)
      console.log(config.plugins[0])
      console.log(config.plugins[config.plugins.length - 1])
      return config;
    }
  }
};