import * as Modes from '../modes';
import keyDefinitions from '../keyDefinitions';

const MODES = Modes.modes;

let CMD_BOLD = keyDefinitions.registerCommand({
  name: 'BOLD',
  default_hotkeys: {
    all: ['ctrl+B']
  }
});
let CMD_ITALIC = keyDefinitions.registerCommand({
  name: 'ITALIC',
  default_hotkeys: {
    all: ['ctrl+I']
  }
});
let CMD_UNDERLINE = keyDefinitions.registerCommand({
  name: 'UNDERLINE',
  default_hotkeys: {
    all: ['ctrl+U']
  }
});
let CMD_STRIKETHROUGH = keyDefinitions.registerCommand({
  name: 'STRIKETHROUGH',
  default_hotkeys: {
    all: ['ctrl+enter']
  }
});

let text_format_normal = (property) => {
  return function() {
    let ndeleted = this.session.toggleRowProperty(property);
    this.session.cursor.setCol(((this.session.cursor.col + ndeleted) - 1));
    return this.keyStream.save();
  };
};

let text_format_insert = (property) => {
  return function() {
    return this.session.cursor.toggleProperty(property);
  };
};

let text_format_visual_line = property =>
  function() {
    let paths = this.session.document.getChildRange(this.parent, this.row_start_i, this.row_end_i);
    let rows = paths.map(path => path.row);
    // TODO: dedup rows to avoid double toggle
    this.session.toggleRowsProperty(property, rows);
    this.session.setMode(MODES.NORMAL);
    return this.keyStream.save();
  }
;

let text_format_visual = property =>
  function() {
    this.session.toggleRowPropertyBetween(property, this.session.cursor, this.session.anchor, {includeEnd: true});
    this.session.setMode(MODES.NORMAL);
    return this.keyStream.save();
  }
;

keyDefinitions.registerAction([MODES.NORMAL], CMD_BOLD, {
  description: 'Bold text',
}, (text_format_normal('bold')));
keyDefinitions.registerAction([MODES.INSERT], CMD_BOLD, {
  description: 'Bold text',
}, (text_format_insert('bold')));
keyDefinitions.registerAction([MODES.VISUAL], CMD_BOLD, {
  description: 'Bold text',
}, (text_format_visual('bold')));
keyDefinitions.registerAction([MODES.VISUAL_LINE], CMD_BOLD, {
  description: 'Bold text',
}, (text_format_visual_line('bold')));
keyDefinitions.registerAction([MODES.NORMAL], CMD_ITALIC, {
  description: 'Italicize text',
}, (text_format_normal('italic')));
keyDefinitions.registerAction([MODES.INSERT], CMD_ITALIC, {
  description: 'Italicize text',
}, (text_format_insert('italic')));
keyDefinitions.registerAction([MODES.VISUAL], CMD_ITALIC, {
  description: 'Italicize text',
}, (text_format_visual('italic')));
keyDefinitions.registerAction([MODES.VISUAL_LINE], CMD_ITALIC, {
  description: 'Italicize text',
}, (text_format_visual_line('italic')));
keyDefinitions.registerAction([MODES.NORMAL], CMD_UNDERLINE, {
  description: 'Underline text',
}, (text_format_normal('underline')));
keyDefinitions.registerAction([MODES.INSERT], CMD_UNDERLINE, {
  description: 'Underline text',
}, (text_format_insert('underline')));
keyDefinitions.registerAction([MODES.VISUAL], CMD_UNDERLINE, {
  description: 'Underline text',
}, (text_format_visual('underline')));
keyDefinitions.registerAction([MODES.VISUAL_LINE], CMD_UNDERLINE, {
  description: 'Underline text',
}, (text_format_visual_line('underline')));
keyDefinitions.registerAction([MODES.NORMAL], CMD_STRIKETHROUGH, {
  description: 'Strike through text',
}, (text_format_normal('strikethrough')));
keyDefinitions.registerAction([MODES.INSERT], CMD_STRIKETHROUGH, {
  description: 'Strike through text',
}, (text_format_insert('strikethrough')));
keyDefinitions.registerAction([MODES.VISUAL], CMD_STRIKETHROUGH, {
  description: 'Strike through text',
}, (text_format_visual('strikethrough')));
keyDefinitions.registerAction([MODES.VISUAL_LINE], CMD_STRIKETHROUGH, {
  description: 'Strike through text',
}, (text_format_visual_line('strikethrough')));