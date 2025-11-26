// content.js
(function () {
  // Run after DOM is ready
  function setDefaultMerits() {
    // Only run on the merit page
    if (!window.location.href.includes("action=merit")) return;

    const meritsInput = document.querySelector('input[name="merits"]');
    if (!meritsInput) return;

    // If it’s 0 or empty, set it to 1
    if (!meritsInput.value || meritsInput.value === "0") {
      meritsInput.value = "1";

      // Optional: also change the defaultValue so form resets keep it as 1
      meritsInput.defaultValue = "1";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setDefaultMerits);
  } else {
    setDefaultMerits();
  }
})();