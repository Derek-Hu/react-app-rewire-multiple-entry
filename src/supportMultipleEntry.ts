import path from 'path';
import { EntryWebpack, EntryMap } from './types/entry';

const defaultEntryName = 'main';

const pwd = process.cwd();
const appIndexes = ['js', 'tsx', 'ts', 'jsx'].map((ext) => 
    path.resolve(pwd, `src/index.${ext}`)
);

export default function(entries:EntryWebpack[] | null) {
  return function(config:any) {
    if (!entries || !entries.length) {
      return config;
    }
    // Multiple Entry JS
    const defaultEntryHTMLPlugin = config.plugins.filter(function(plugin:any) {
      return plugin.constructor.name === 'HtmlWebpackPlugin';
    })[0];
    defaultEntryHTMLPlugin.options.chunks = [defaultEntryName];

    // config.entry is not an array in Create React App 4
    if (!Array.isArray(config.entry)) {
      config.entry = [config.entry];
    }

    // If there is only one entry file then it should not be necessary for the rest of the entries
    const necessaryEntry = config.entry.length === 1 ? [] : config.entry.filter(function(file:string) {
      return !appIndexes.includes(file);
    });
    const multipleEntry:EntryMap = {};
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
  };
}
