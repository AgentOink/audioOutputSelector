(function () {
  if (window.tabAudioSelectHasRun) return;
  window.tabAudioSelectHasRun = true;

  browser.runtime.onMessage.addListener(message => {
    let elements = document.querySelectorAll('audio, video');
    if (elements.length) {
      if (message.command == 'select') selectAudioOutput(elements);
      else if (message.command == 'reset') setSinkIds(elements, '');
    }
    else browser.runtime.sendMessage({ message: 'NoElementsError' });
  });

  function setSinkIds(elements, id) {
    document.querySelectorAll('audio, video')
      .forEach(el => { el.setSinkId(id); });
  }

  function selectAudioOutput(elements) {
    if (navigator.mediaDevices.selectAudioOutput) {
      navigator.mediaDevices.selectAudioOutput()
        .then(output => {
          setSinkIds(elements, output.deviceId);
          console.log('[tabAudioSelector] Selected device: ' + output.label);
        })
        .catch(err => {
          if (err.name == 'InvalidStateError') {
            browser.runtime.sendMessage({ message: 'TransientError' });
            console.error('[tabAudioSelector] [ERROR] Transient user activation check failed!');
            console.warn('[tabAudioSelector [WARN] Please interact with the webpage and try again!');
          }
          else if (err.name == 'NotAllowedError') {
            console.warn('[tabAudioSelector] [WARN] Request blocked by user, browser, or platform.')
          }
          else {
            browser.runtime.sendMessage({ message: err.name });
            console.error(`[tabAudioSelector] [ERROR] ${err.name}: ${err.message}`);
          }
        });
    }
    else {
      browser.runtime.sendMessage({ message: 'SetSinkIdError' });
      console.error('[tabAudioSelector] [ERROR] setSinkId not enabled!');
      console.warn('[tabAudioSelector] [WARN] Please set \'media.setsinkid.enabled\' to \'true\' in \'about:config\'!')
    }
  }

})();