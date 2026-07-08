const test = require('node:test');
const assert = require('node:assert/strict');
const { createUndoManager } = require('../undo-utils.js');

test('undo manager restores the previous textarea state', () => {
  const manager = createUndoManager();
  const textarea = {
    value: 'hello',
    selectionStart: 5,
    selectionEnd: 5,
  };

  manager.push(textarea);
  textarea.value = 'hello [b]world[/b]';
  textarea.selectionStart = 13;
  textarea.selectionEnd = 13;

  const restored = manager.undo(textarea);

  assert.equal(restored.value, 'hello');
  assert.equal(restored.selectionStart, 5);
  assert.equal(restored.selectionEnd, 5);
});
