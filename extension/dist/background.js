chrome.runtime.onMessageExternal.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    console.log(request);
    sendResponse({ connected: true });
  });

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) { 
    console.log(request)
    if(request.message === 'getEnvironment') {
      console.log('getting')
      chrome.storage.local.get(['environment'], function(result) {
        console.log(result)
        const env = result.environment;
        chrome.runtime.sendMessage({ message: "environment", environment: env });
        return sendResponse({environment: env});
      });
    }
  });


  chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name === "contentScript");
    port.onMessage.addListener(function(msg) {
      if(msg.message === 'getEnvironment') {
        console.log('getting')
        chrome.storage.local.get(['environment'], function(result) {
          console.log(result)
          const env = result.environment;
          port.postMessage({ message: "environment", environment: env });
        });
      }
    });
  });