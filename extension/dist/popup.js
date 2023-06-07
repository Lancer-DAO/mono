document.addEventListener('DOMContentLoaded', function() {
  console.log('loaded')
    var checkPageButton = document.getElementById('button-app');
    checkPageButton.addEventListener('click', function() {
      console.log('hi from app')
      chrome.storage.local.set({environment: 'app'}, function() {
        console.log('Value is set to ' + 'app');
    chrome.runtime.sendMessage({ message: "getEnvironment" });

      })
    }, false);
  }, false);

  document.addEventListener('DOMContentLoaded', function() {
    var checkPageButton = document.getElementById('button-demo');
    checkPageButton.addEventListener('click', function() {
  
      chrome.storage.local.set({environment: 'demo'}, function() {
        console.log('Value is set to ' + 'demo');
    chrome.runtime.sendMessage({ message: "getEnvironment" });

      })
    }, false);
  }, false);

  document.addEventListener('DOMContentLoaded', function() {
    var checkPageButton = document.getElementById('button-local');
    checkPageButton.addEventListener('click', function() {
  
      chrome.storage.local.set({environment: 'local'}, function() {
        console.log('Value is set to ' + 'local');
    chrome.runtime.sendMessage({ message: "getEnvironment" });
        
        
      })
    }, false);
  }, false);

  document.addEventListener('DOMContentLoaded', function() {
    chrome.runtime.sendMessage({ message: "getEnvironment", isPopup: true });
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      console.log(request)
      if (request.message === 'environment') {
        console.log('getting')
        const curr = document.getElementsByClassName('selected')
        if(curr?.length > 0) {
          curr[0].classList.remove('selected')
        }

    var checkPageButton = document.getElementById(`button-${request.environment}`);
    checkPageButton.classList.add('selected')
      
      }
    })
  }, false);