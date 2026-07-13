const test = require('node:test');
const assert = require('node:assert/strict');
const { isTargetPage, injectBoldTitleStyle } = require('../page-style-utils.js');

test('detects the requested unread and watchlist actions', () => {
  assert.equal(isTargetPage('https://bitcointalk.org/index.php?action=unreadreplies'), true);
  assert.equal(isTargetPage('https://bitcointalk.org/index.php?action=unread'), true);
  assert.equal(isTargetPage('https://bitcointalk.org/index.php?action=watchlist'), true);
  assert.equal(isTargetPage('https://bitcointalk.org/index.php?action=profile;u=1'), false);
});

test('injects the bold title stylesheet once for target pages', () => {
  const createdNodes = [];
  const elementsById = new Map();
  const head = {
    appendChild(node) {
      createdNodes.push(node);
      elementsById.set(node.id, node);
    },
  };

  const documentRef = {
    head,
    location: { href: 'https://bitcointalk.org/index.php?action=watchlist' },
    createElement(tagName) {
      return { tagName: tagName.toLowerCase(), id: '', textContent: '' };
    },
    getElementById(id) {
      return elementsById.get(id) || null;
    },
  };

  assert.equal(injectBoldTitleStyle(documentRef), true);
  assert.equal(injectBoldTitleStyle(documentRef), true);
  assert.equal(createdNodes.length, 1);
  assert.equal(createdNodes[0].id, 'bbcode-target-title-style');
  assert.match(createdNodes[0].textContent, /font-weight:bold/);
});
