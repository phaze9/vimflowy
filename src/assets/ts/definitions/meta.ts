import keyDefinitions, { Action, SequenceAction } from '../keyDefinitions';

keyDefinitions.registerAction(new Action(
  'export-file',
  'Export as Json file',
  async function({ session }) {
    await session.exportFile('json');
  },
  {
    sequence: SequenceAction.DROP,
  },
));

keyDefinitions.registerAction(new Action(
  'copy-selected-as-markdown',
  'Copy selected node and its children as Markdown',
  async function({ session }) {
    session.emit('copyToClipboard', await session.exportSelectedMarkdown());
  },
  {
    sequence: SequenceAction.DROP,
  },
));

