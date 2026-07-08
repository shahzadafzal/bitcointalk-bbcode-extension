(function (root, factory) {
  const api = factory();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.BBCodeUndoUtils = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function createUndoManager(limit = 20) {
    const stacks = new Map();

    function getStack(textarea) {
      if (!stacks.has(textarea)) {
        stacks.set(textarea, []);
      }

      return stacks.get(textarea);
    }

    return {
      push(textarea) {
        if (!textarea) return;

        const stack = getStack(textarea);
        stack.push({
          value: textarea.value,
          selectionStart: textarea.selectionStart,
          selectionEnd: textarea.selectionEnd,
        });

        if (stack.length > limit) {
          stack.shift();
        }
      },
      undo(textarea) {
        if (!textarea) return null;

        const stack = getStack(textarea);
        const snapshot = stack.pop();
        if (!snapshot) {
          return null;
        }

        textarea.value = snapshot.value;
        textarea.selectionStart = snapshot.selectionStart;
        textarea.selectionEnd = snapshot.selectionEnd;
        return snapshot;
      },
    };
  }

  return { createUndoManager };
});
