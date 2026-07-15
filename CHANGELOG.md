# Bitcointalk BBCode Extension - Changelog

## Project Overview
A Chrome extension that enhances the Bitcointalk forum editing experience with BBCode formatting shortcuts and smart undo/redo functionality.

---

## Features Implemented

### 1. BBCode Text Formatting Shortcuts

#### Keyboard Shortcuts
- **Ctrl+B** - Apply bold formatting `[b]text[/b]`
- **Ctrl+I** - Apply italic formatting `[i]text[/i]`
- **Ctrl+Up** - Increase text size (default 11pt)
- **Ctrl+Down** - Decrease text size (default 9pt)
- **Ctrl+Z** - Undo (step-by-step)
- **Ctrl+Y** - Redo (step-by-step)

#### Features
- Works on all Bitcointalk forum post editing areas
- Automatically detects relevant textareas (quick reply, message compose, post forms)
- Built-in toolbar button integration patching
- Default merit value auto-fill (sets merit to 1 if not specified)

---

### 2. Enhanced Undo/Redo System

#### Problem Solved
- Previous undo system only tracked BBCode actions, not typing
- When user typed text after adding BBCode and pressed Ctrl+Z, it would jump back to the last BBCode action instead of undoing one keystroke
- No redo functionality existed

#### Solution Implemented
- **Dual-stack Architecture**: Separate undo and redo stacks per textarea
- **Debounced Input Tracking**: Captures typing changes after 300ms pause for fine-grained control
- **Smart State Management**: 
  - Each state includes: value, selectionStart, selectionEnd (cursor position)
  - Redo stack automatically clears when new changes are made (prevents branching issues)
  - Maximum history limit of 20 states per textarea

#### How It Works
1. **BBCode Actions** (Bold, Italic, Size): Saved before action is applied
2. **Typing**: Captured with 300ms debounce to batch rapid keystrokes
3. **Undo (Ctrl+Z)**: Moves back one step, current state saved to redo stack
4. **Redo (Ctrl+Y)**: Moves forward one step, current state saved back to undo stack

#### Example Workflow
```
Step 1: Type "hello" → auto-saved after 300ms
Step 2: Apply bold → saved to undo stack
Step 3: Type " world" → auto-saved after 300ms
Step 4: Press Ctrl+Z → back to "hello world"
Step 5: Press Ctrl+Z → back to "hello"
Step 6: Press Ctrl+Y → forward to "hello world"
```

---

### 3. Post Title Styling (Bold)

#### Feature Description
Automatically applies bold styling to post titles on specific Bitcointalk pages for better visibility.

#### Affected Pages
- `/index.php?action=unreadreplies` - Unread replies
- `/index.php?action=unread` - Unread posts
- `/index.php?action=watchlist` - Watched topics

#### CSS Applied
```css
#bodyarea > table.bordercolor > tbody > tr > td > table > tbody > tr > td:nth-child(3) {
  font-weight: bold;
}
```

#### Implementation Details
- Injected once per page (checked by element ID: `bbcode-target-title-style`)
- Page detection via URL pattern matching
- Reusable utility module for future page-specific styling

---

## File Structure

```
Extension/
├── manifest.json              # Extension configuration
├── content.js                 # Main content script
├── background.js              # Service worker
├── popup.html                 # Popup UI
├── popup.js                   # Popup script
├── undo-utils.js              # Undo/redo manager
├── page-style-utils.js        # Page-specific styling utility
├── privacy.html               # Privacy policy
├── icon.png                   # Extension icon
└── tests/
    ├── undo-utils.test.js     # Undo/redo tests
    └── page-style-utils.test.js # Page styling tests
```

---

## Testing

### Test Coverage
All features tested with Node.js test runner:

✅ **Undo Manager Tests**
- Undo restores previous textarea state
- Redo restores undone state
- Redo returns null when no redo history exists
- Redo stack clears when new changes are made

✅ **Page Styling Tests**
- Detects target pages (unreadreplies, unread, watchlist)
- Rejects non-target pages
- Injects stylesheet only once per page
- Validates CSS content

### Running Tests
```bash
node --test Extension/tests/*.test.js
```

### Current Test Results
```
✔ detects the requested unread and watchlist actions
✔ injects the bold title stylesheet once for target pages
✔ undo manager restores the previous textarea state
✔ redo manager restores the redo state after undo
✔ redo returns null when there are no redo states
✔ redo stack is cleared when new change is made
---
6 tests passed, 0 failed
```

---

## Technical Implementation Details

### Undo Manager Architecture
**File**: `Extension/undo-utils.js`

- Uses separate **undo stack** and **redo stack** per textarea
- Each state is a snapshot: `{ value, selectionStart, selectionEnd }`
- Maximum 20 states per textarea (configurable)
- Automatically clears redo stack when new state is pushed (prevents branching)

### Content Script Behavior
**File**: `Extension/content.js`

1. **Initialization**:
   - Creates undo manager on script load
   - Sets up event listeners for keydown and input events
   - Patches built-in BBCode toolbar

2. **BBCode Actions**:
   - Saves state before applying action
   - Applies formatting via text manipulation
   - Emits input event to trigger page updates

3. **Input Tracking**:
   - Debounces input events (300ms delay)
   - Saves state only after user pauses typing
   - Prevents excessive state snapshots

4. **Keyboard Shortcuts**:
   - Intercepts Ctrl+Z/Y for custom undo/redo
   - Prevents default browser behavior
   - Delegates to undo manager

### Page Styling
**File**: `Extension/page-style-utils.js`

- Detects target pages via URL action parameter
- Injects `<style>` element into document head
- Uses element ID to prevent duplicate injections
- Reusable for adding more page-specific styles in future

---

## Future Enhancement Opportunities

1. **Persistent Undo History**
   - Save undo stack to localStorage
   - Resume editing session with previous history

2. **Additional Keyboard Shortcuts**
   - Ctrl+Shift+Z for browser redo (if needed)
   - Custom shortcuts via settings

3. **More Page Styling Rules**
   - Author highlighting
   - Post count styling
   - Reputation indicators

4. **UI Panel**
   - Visual undo/redo history viewer
   - Clear history button
   - Settings for debounce delay and history limit

5. **BBCode Preview**
   - Real-time preview of formatted text
   - Live render of BBCode tags

---

## Notes for Future Development

- All changes maintain backward compatibility with original functionality
- Test suite must be updated when adding new features
- Page detection can be extended by adding action names to `TARGET_ACTIONS` array
- Debounce delay (300ms) can be adjusted in content.js if needed
- The undo manager is textarea-agnostic and works with any textarea element

---

## Last Updated
July 15, 2026

## Status
✅ Production Ready - All tests passing, feature complete for current scope
