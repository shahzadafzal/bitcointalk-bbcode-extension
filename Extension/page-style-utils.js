(function (root, factory) {
  const api = factory();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  root.BBCodePageStyleUtils = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const TARGET_ACTIONS = ['unreadreplies', 'unread', 'watchlist'];

  function isTargetPage(url) {
    if (!url) return false;

    const normalizedUrl = url.toLowerCase();
    const actionMatch = normalizedUrl.match(/[?&]action=([^&#]+)/);
    if (!actionMatch) return false;

    return TARGET_ACTIONS.includes(actionMatch[1].toLowerCase());
  }

  function injectBoldTitleStyle(documentRef = document) {
    if (!documentRef || !documentRef.head || !isTargetPage(documentRef.location && documentRef.location.href)) {
      return false;
    }

    const existingStyle = documentRef.getElementById('bbcode-target-title-style');
    if (existingStyle) {
      return true;
    }

    const style = documentRef.createElement('style');
    style.id = 'bbcode-target-title-style';
    style.textContent = '#bodyarea > table.bordercolor > tbody > tr > td > table > tbody > tr > td:nth-child(3){font-weight:bold;}';
    documentRef.head.appendChild(style);
    return true;
  }

  return { TARGET_ACTIONS, isTargetPage, injectBoldTitleStyle };
});
