// background.js
chrome.commands.onCommand.addListener(function (command) {
  if (command === "toggle-bold") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: executeScript
      });
    });
  }
  
  if (command === "toggle-italic") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: executeItalicScript
      });
    });
  }
  
  if (command === "size-up") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: executeSizeUp
      });
    });
  }
  
  if (command === "size-down") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: executeSizeDown
      });
    });
  }
  
});

function executeScript() {
	const textarea = document.querySelector('textarea'); 
    const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    const newText = `[b]${selectedText}[/b]`;
    const textBeforeSelection = textarea.value.substring(0, textarea.selectionStart);
    const textAfterSelection = textarea.value.substring(textarea.selectionEnd);
    const updatedText = textBeforeSelection + newText + textAfterSelection;

    textarea.value = updatedText;

    textarea.selectionStart = textBeforeSelection.length;
    textarea.selectionEnd = textarea.selectionStart + newText.length;
}

function executeItalicScript() {    
	const textarea = document.querySelector('textarea'); 
    const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    const newText = `[i]${selectedText}[/i]`;
    const textBeforeSelection = textarea.value.substring(0, textarea.selectionStart);
    const textAfterSelection = textarea.value.substring(textarea.selectionEnd);
    const updatedText = textBeforeSelection + newText + textAfterSelection;
   
    textarea.value = updatedText;

    textarea.selectionStart = textBeforeSelection.length;
    textarea.selectionEnd = textarea.selectionStart + newText.length;
}

function executeSizeUp() {
	const tagOpen='[size=10pt]';
	const tagClose='[/size]';
	
   	const textarea = document.querySelector('textarea'); 
    const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
		
	const newText = (selectedText.startsWith('[size=') ? selectedText.replace(/\[size=(\d+)pt\]/, (match, size) => `[size=${parseInt(size, 10) + 1}pt]`) : `${tagOpen}${selectedText}${tagClose}`);
  	
    const textBeforeSelection = textarea.value.substring(0, textarea.selectionStart);
    const textAfterSelection = textarea.value.substring(textarea.selectionEnd);
    const updatedText = textBeforeSelection + newText + textAfterSelection;
   
    textarea.value = updatedText;

    textarea.selectionStart = textBeforeSelection.length;
    textarea.selectionEnd = textarea.selectionStart + newText.length;
}

function executeSizeDown() {
	const tagOpen='[size=9pt]';
	const tagClose='[/size]';
	
   	const textarea = document.querySelector('textarea'); 
    const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
		
	const newText = (selectedText.startsWith('[size=') ? selectedText.replace(/\[size=(\d+)pt\]/, (match, size) => `[size=${parseInt(size, 10) - 1}pt]`) : `${tagOpen}${selectedText}${tagClose}`);
  	
    const textBeforeSelection = textarea.value.substring(0, textarea.selectionStart);
    const textAfterSelection = textarea.value.substring(textarea.selectionEnd);
    const updatedText = textBeforeSelection + newText + textAfterSelection;
   
    textarea.value = updatedText;

    textarea.selectionStart = textBeforeSelection.length;
    textarea.selectionEnd = textarea.selectionStart + newText.length;
}

