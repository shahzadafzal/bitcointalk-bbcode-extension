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
  assert.equal(textarea.value, 'hello');
});

test('redo manager restores the redo state after undo', () => {
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

  manager.undo(textarea);
  assert.equal(textarea.value, 'hello');

  const redoResult = manager.redo(textarea);
  assert.equal(redoResult.value, 'hello [b]world[/b]');
  assert.equal(textarea.value, 'hello [b]world[/b]');
  assert.equal(textarea.selectionStart, 13);
  assert.equal(textarea.selectionEnd, 13);
});

test('redo returns null when there are no redo states', () => {
  const manager = createUndoManager();
  const textarea = {
    value: 'hello',
    selectionStart: 5,
    selectionEnd: 5,
  };

  manager.push(textarea);
  textarea.value = 'hello world';

  const redoResult = manager.redo(textarea);
  assert.equal(redoResult, null);
});

test('redo stack is cleared when new change is made', () => {
  const manager = createUndoManager();
  const textarea = {
    value: 'hello',
    selectionStart: 5,
    selectionEnd: 5,
  };

  manager.push(textarea);
  textarea.value = 'hello world';

  manager.undo(textarea);
  assert.equal(textarea.value, 'hello');

  textarea.value = 'hello new text';
  manager.push(textarea);

  const redoResult = manager.redo(textarea);
  assert.equal(redoResult, null);
});
