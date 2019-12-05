import supportMultipleEntry from './supportMultipleEntry';
import getValidSettings from './getValidSettings';
import { EntryParam } from './types/entry';

function main(params: EntryParam[]) {
  const entries = getValidSettings(params);
  const addMultiEntry = supportMultipleEntry(entries);
  return {
    addMultiEntry
  }
};
export default main;
module.exports = main;