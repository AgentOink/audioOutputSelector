
function main() {
  browser.runtime.onMessage.addListener(reportError);

  document.addEventListener('click', (el) => {
    function reportError(err) {
      console.error(`[tabAudioSelector] [ERROR] ${err}`);
    }

    function select(tabs) {
      browser.tabs.sendMessage(tabs[0].id, { command: "select" });
    }

    function reset(tabs) {
      browser.tabs.sendMessage(tabs[0].id, { command: "reset" });
    }

    if (el.target.classList.contains('select')) {
      browser.tabs.query({ active: true, currentWindow: true })
        .then(select)
        .catch(reportError);
    }
    else if (el.target.classList.contains('reset')) {
      browser.tabs.query({ active: true, currentWindow: true })
        .then(reset)
        .catch(reportError);
    }
  });
}

//Report any errors executing the script
function reportError(err) {
  switch (err.message) {
    case 'SetSinkIdError':
      document.querySelector('#error-option-setsinkid').classList.remove('hidden');
      break;
    case 'TransientError':
      document.querySelector('#error-option-transient').classList.remove('hidden');
      break;
    case 'NoElementsError':
      document.querySelector('#error-option-noelements').classList.remove('hidden');
      break;
    default:
      document.querySelector('#error-unknown').classList.remove('hidden');
      document.querySelector('#error-unknown-text').textContent = err.message;
  }
}

//Execute the script, generate listeners, handle errors
browser.tabs.executeScript({ file: "/content_scripts/content.js" })
  .then(main)
  .catch(reportError);