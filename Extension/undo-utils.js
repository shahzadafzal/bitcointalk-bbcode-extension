(function (root, factory) {
  const api = factory();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.BBCodeUndoUtils = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function createUndoManager(limit = 20) {
    const undoStacks = new Map();
    const redoStacks = new Map();

    function getUndoStack(textarea) {
      if (!undoStacks.has(textarea)) {
        undoStacks.set(textarea, []);
      }
      return undoStacks.get(textarea);
    }

    function getRedoStack(textarea) {
      if (!redoStacks.has(textarea)) {
        redoStacks.set(textarea, []);
      }
      return redoStacks.get(textarea);
    }

    function getCurrentState(textarea) {
      return {
        value: textarea.value,
        selectionStart: textarea.selectionStart,
        selectionEnd: textarea.selectionEnd,
      };
    }

    return {
      push(textarea) {
        if (!textarea) return;

        const undoStack = getUndoStack(textarea);
        undoStack.push(getCurrentState(textarea));

        if (undoStack.length > limit) {
          undoStack.shift();
        }

        // Clear redo stack when new change is made
        const redoStack = getRedoStack(textarea);
        redoStack.length = 0;
      },

      undo(textarea) {
        if (!textarea) return null;

        const undoStack = getUndoStack(textarea);
        const redoStack = getRedoStack(textarea);

        if (undoStack.length === 0) {
          return null;
        }

        // Save current state to redo stack
        redoStack.push(getCurrentState(textarea));

        // Pop previous state from undo stack
        const snapshot = undoStack.pop();
        textarea.value = snapshot.value;
        textarea.selectionStart = snapshot.selectionStart;
        textarea.selectionEnd = snapshot.selectionEnd;
        return snapshot;
      },

      redo(textarea) {
        if (!textarea) return null;

        const redoStack = getRedoStack(textarea);

        if (redoStack.length === 0) {
          return null;
        }

        const undoStack = getUndoStack(textarea);

        // Save current state to undo stack
        undoStack.push(getCurrentState(textarea));

        // Pop state from redo stack
        const snapshot = redoStack.pop();
        textarea.value = snapshot.value;
        textarea.selectionStart = snapshot.selectionStart;
        textarea.selectionEnd = snapshot.selectionEnd;
        return snapshot;
      },
    };
  }

  return { createUndoManager };
});
