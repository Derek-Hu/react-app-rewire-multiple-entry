import path from 'path';
import { formatName, checkFileExist } from './utils';
import { EntryParam, EntryWebpack } from './types/entry';

const pwd = process.cwd();
const appHtml = path.resolve(pwd, 'public/index.html');

// Prepare Data for Multiple Entry
export default function(params:EntryParam[]):EntryWebpack[] | null {
  const isArray = Object.prototype.toString.call(params) === '[object Array]';

  if (!isArray) {
    return null;
  }
  const settings = params.filter(function(entry) {
    return entry && Object.keys(entry).length;
  });

  if (!settings || !settings.length) {
    return null;
  }

  return settings.map(function(entry) {
    if (!entry.entry) {
      throw new Error(
        'Missing attribute [entry], Received  ' + JSON.stringify(entry)
      );
    }
    entry.template = entry.template? path.resolve(pwd, entry.template) : appHtml;

    if (!entry.outPath) {
      entry.outPath = path.relative(pwd, entry.template).replace(/\\/g, '/');
    }
    entry.outPath = entry.outPath.replace(/^\//, '').replace(/\/$/, '');

    const entryPath = path.resolve(pwd, entry.entry);
    
    checkFileExist(entry.template);
    checkFileExist(entryPath);

    return {
      name: formatName(entry.entry, entry?.omitHash),
      entry: entryPath,
      template: entry.template,
      outPath: entry.outPath
    };
  });
}
