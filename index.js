'use strict';

const path = require('path');
const fs = require('fs');
const pwd = process.cwd();
const XXH = require('xxhashjs');

const H = XXH.h32(0xABCD) // seed = 0xABCD

const appIndexes = ['js', 'ts', 'jsx', 'tsx'].map(
  ext => path.resolve(pwd, `src/index.${ext}`
);
const appHtml = path.resolve(pwd, 'public/index.html');

const formatName = function (name) {
  return name.split('/').reverse()[0].match(/^[^.]*/)[0] + '.' + H.update(name).digest().toString(16);
};

const checkFileExist = function(file){
  if (!fs.existsSync(file)) {
    throw new Error('File not found: ' + file);
  }
}

const defaultEntryName = 'main';

module.exports = function (params) {
  // Prepare Data for Multiple Entry
  const isArray = Object.prototype.toString.call(params) === '[object Array]';

  const validElements = params.filter(function(entry){
    return entry && Object.keys(entry).length;
  });

  const entries = isArray && validElements && validElements.map(function (entry) {
    if (!entry.entry) {
      throw new Error('Missing attribute [entry], Received  '+JSON.stringify(entry));
    }
    if (!entry.template) {
      entry.template = appHtml;
    } else {
      entry.template = path.resolve(pwd, entry.template);
    }
    if (!entry.outPath) {
      entry.outPath = path.relative(pwd, entry.template).replace(/\\/g, '/')
    }
    entry.outPath = entry.outPath.replace(/^\//, '').replace(/\/$/, '');

    checkFileExist(entry.template);
    const entryPath = path.resolve(pwd, entry.entry);

    checkFileExist(entryPath);

    return {
      name: formatName(entry.entry),
      entry: entryPath,
      template: entry.template,
      outPath: entry.outPath,
      proxyPath: '/build/' + entry.outPath,
      pattern: new RegExp('^' + entry.outPath.replace(/[-/\\^$&*+?.()|[\]{}]/g, '\\$&')),
    }
  });
  return {
    addMultiEntry: function (config) {
      if(!entries || !entries.length){
        return config;
      }
      // Multiple Entry JS
      const defaultEntryHTMLPlugin = config.plugins.filter(function(plugin){
        return plugin.constructor.name === 'HtmlWebpackPlugin'
      })[0];
      defaultEntryHTMLPlugin.options.chunks = [defaultEntryName];
      const necessaryEntry = config.entry.filter(function(file){
        return !appIndexes.includes(file);
      });
      const multipleEntry = {};
      multipleEntry[defaultEntryName] = config.entry;

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
      return config;
    }
  }
};
