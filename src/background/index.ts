import { convertToQueryParams, getAppEndpointExtenstion } from "@/utils";
const NEW_ISSUE_INFO_KEY = 'fundingIssueInfo'

const WINDOW_LAYOUT: chrome.windows.CreateData = {
  url: '',
  type: "normal",
  height: 920,
  width: 500,
  left: 0,
  top: 0,
};


chrome.runtime.onMessage.addListener(async (request, sender) => {
  console.log('request', request)
  if (request.message === "fund_issue") {
    const newIssue = {fundingIssueInfo: request.issue}
    console.log('newIssue', newIssue)
    await chrome.storage.local.set(newIssue);
    chrome.windows.create({
      ...WINDOW_LAYOUT,
      // left: request.windowWidth - 520,
      url: `${getAppEndpointExtenstion()}fund?extension_id=${sender.id}`,
    })
    return true;
  }  else if (request.message === "distribute_pull_request_split") {
    chrome.storage.local.set({"distributeFundsInfo": request.issue});
    chrome.windows.create({
      ...WINDOW_LAYOUT,
      // left: request.windowWidth - 520,
      url: `${getAppEndpointExtenstion()}approve?${convertToQueryParams(request.issue)}`
    })
    return true;
  }
});

chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    if(request.route === 'newIssueFundingInfo') {
      chrome.storage.local.get(NEW_ISSUE_INFO_KEY, (data) => {
        console.log(data)
        sendResponse({'issue': data[NEW_ISSUE_INFO_KEY]})
      })
    } else {
      sendResponse({'connected': 'true'})
    }
  });


chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
  console.log('sending page update')
  chrome.tabs.sendMessage(details.tabId, {message: 'page_update'})
});