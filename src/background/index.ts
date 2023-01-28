import { convertToQueryParams } from "@/utils";
import { Issue } from "@/types";

const convertSpaces = (str: string) :string => {
  return str.replace(/ /g, '.space.')
}

const WINDOW_LAYOUT: chrome.windows.CreateData = {
  url: '',
  type: "normal",
  height: 920,
  width: 520,
  left: 0,
  top: 0,
};


chrome.runtime.onMessage.addListener((request) => {
  console.log('request', request)
  if (request.message === "fund_issue") {
    chrome.windows.create({
      ...WINDOW_LAYOUT,
      left: request.windowWidth - 520,
      url: `https://app-dot-lancer-api-375702.uc.r.appspot.com/fund?${convertSpaces(convertToQueryParams(request.issue))}`
    })
    return true;
  }  else if (request.message === "distribute_pull_request_split") {
    chrome.windows.create({
      ...WINDOW_LAYOUT,
      left: request.windowWidth - 520,
      url: `https://app-dot-lancer-api-375702.uc.r.appspot.com/approve?${convertToQueryParams(request.issue)}`
    })
    return true;
  }
});


chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
  console.log('sending page update')
  chrome.tabs.sendMessage(details.tabId, {message: 'page_update'})
});