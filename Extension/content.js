// content.js
(function () {
  const undoManager = window.BBCodeUndoUtils && window.BBCodeUndoUtils.createUndoManager
    ? window.BBCodeUndoUtils.createUndoManager(20)
    : null;

  function setDefaultMerits() {
    if (!window.location.href.includes("action=merit")) return;

    const meritsInput = document.querySelector('input[name="merits"]');
    if (!meritsInput) return;

    if (!meritsInput.value || meritsInput.value === "0") {
      meritsInput.value = "1";
      meritsInput.defaultValue = "1";
    }
  }

  function isTextarea(element) {
    return Boolean(element && element.tagName && element.tagName.toLowerCase() === "textarea");
  }

  function isRelevantTextarea(textarea) {
    if (!isTextarea(textarea) || !textarea.isConnected) return false;

    const url = window.location.href.toLowerCase();
    if (url.includes("action=post2") || url.includes("action=post")) {
      return true;
    }

    const id = (textarea.id || "").toLowerCase();
    const name = (textarea.name || "").toLowerCase();
    const className = (textarea.className || "").toLowerCase();
    const placeholder = (textarea.placeholder || "").toLowerCase();
    const form = textarea.closest("form");
    const submitButton = form ? form.querySelector("input[type='submit'], button[type='submit']") : null;

    return Boolean(
      id.includes("quick") ||
        name.includes("quick") ||
        className.includes("quick") ||
        name.includes("message") ||
        name.includes("post") ||
        placeholder.includes("quick") ||
        submitButton
    );
  }

  function getTargetTextarea() {
    const active = document.activeElement;
    if (isRelevantTextarea(active)) {
      return active;
    }

    const textareas = Array.from(document.querySelectorAll("textarea"));
    return textareas.find(isRelevantTextarea) || null;
  }

  function saveUndoState(textarea) {
    if (undoManager && textarea) {
      undoManager.push(textarea);
    }
  }

  function emitInput(textarea) {
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function applyWrap(textarea, openTag, closeTag) {
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? start;
    const selectedText = textarea.value.substring(start, end);
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    const replacement = `${openTag}${selectedText}${closeTag}`;

    textarea.value = before + replacement + after;
    const cursorStart = before.length + openTag.length;
    const cursorEnd = selectedText.length ? cursorStart + selectedText.length : cursorStart;
    textarea.focus();
    textarea.setSelectionRange(cursorStart, cursorEnd);
    emitInput(textarea);
  }

  function applySize(textarea, delta) {
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? start;
    const selectedText = textarea.value.substring(start, end);
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    const nextSize = delta > 0 ? 10 : 9;
    const tagOpen = `[size=${nextSize}pt]`;
    const tagClose = "[/size]";
    const replacement = selectedText.startsWith("[size=")
      ? selectedText.replace(/\[size=(\d+)pt\]/, (match, size) => `[size=${parseInt(size, 10) + delta}pt]`)
      : `${tagOpen}${selectedText}${tagClose}`;

    textarea.value = before + replacement + after;
    const cursorStart = before.length + tagOpen.length;
    const cursorEnd = selectedText.length ? cursorStart + selectedText.length : cursorStart;
    textarea.focus();
    textarea.setSelectionRange(cursorStart, cursorEnd);
    emitInput(textarea);
  }

  function performAction(action) {
    const textarea = getTargetTextarea();
    if (!textarea) return false;

    if (action !== "undo") {
      saveUndoState(textarea);
    }

    switch (action) {
      case "bold":
        applyWrap(textarea, "[b]", "[/b]");
        break;
      case "italic":
        applyWrap(textarea, "[i]", "[/i]");
        break;
      case "size-up":
        applySize(textarea, 1);
        break;
      case "size-down":
        applySize(textarea, -1);
        break;
      case "undo":
        if (undoManager) {
          undoManager.undo(textarea);
          textarea.focus();
          emitInput(textarea);
        }
        break;
      default:
        return false;
    }

    return true;
  }

  function patchBuiltInToolbar() {
    if (window.__bbcodeToolbarPatched) return;

    const original = window.bbc_highlight;
    if (typeof original !== "function") {
      return;
    }

    window.bbc_highlight = function wrappedBbcHighlight() {
      const textarea = getTargetTextarea();
      if (textarea) {
        saveUndoState(textarea);
      }

      return original.apply(this, arguments);
    };

    window.__bbcodeToolbarPatched = true;
  }

  function ensureBuiltInToolbarPatch(attempts) {
    patchBuiltInToolbar();

    if (!window.__bbcodeToolbarPatched && attempts < 10) {
      window.setTimeout(function () {
        ensureBuiltInToolbarPatch(attempts + 1);
      }, 200);
    }
  }

  function handleShortcut(event) {
    if (!event || !document.body) return;

    const activeTextarea = getTargetTextarea();
    if (!activeTextarea) return;

    const isCtrlOrMeta = event.ctrlKey || event.metaKey;
    if (!isCtrlOrMeta) return;

    if (event.altKey) return;

    if (event.key.toLowerCase() === "z") {
      event.preventDefault();
      event.stopPropagation();
      performAction("undo");
      return;
    }

    if (event.key.toLowerCase() === "b") {
      event.preventDefault();
      event.stopPropagation();
      performAction("bold");
      return;
    }

    if (event.key.toLowerCase() === "i") {
      event.preventDefault();
      event.stopPropagation();
      performAction("italic");
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      performAction("size-up");
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();
      performAction("size-down");
      return;
    }
  }

  document.addEventListener("keydown", handleShortcut, true);
  ensureBuiltInToolbarPatch(0);

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message && message.type === "bbcode-action") {
      performAction(message.action);
      sendResponse(true);
    }

    return true;
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setDefaultMerits);
  } else {
    setDefaultMerits();
  }
})();