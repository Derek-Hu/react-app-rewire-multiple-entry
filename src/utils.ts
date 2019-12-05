import fs from 'fs';
import XXH from 'xxhashjs';

const H = XXH.h32(0xabcd); // seed = 0xABCD

export const formatName = function (name: string) {
  if (!name) {
    name = '';
  }
  return (
    name
      .split('/')
      .reverse()[0]
      .match(/^[^.]*/)[0] +
    '.' +
    H.update(name)
      .digest()
      .toString(16)
  );
};

export const checkFileExist = function (file: string) {
  if (!fs.existsSync(file)) {
    throw new Error('File not found: ' + file);
  }
};
