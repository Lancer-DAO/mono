import { Issue } from "@/types";

const WINDOW_LAYOUT: chrome.windows.CreateData = {
  url: chrome.runtime.getURL("./popup.html"),
  type: "panel",
  height: 920,
  width: 520,
  left: 4720,
  top: 0,
};

const setIssueFundingInitial = (issue: Issue, sendResponse: (response: any) => void) => {
  chrome.storage.local.get("fundedIssues", (data) => {
    if (chrome.runtime.lastError) {
      sendResponse({
        message: "fail",
      });

      return;
    }
    const fundedIssues = data.fundedIssues || [];
    fundedIssues.push(issue);

    chrome.storage.local.set(
      {
        fundedIssues: fundedIssues,
      },
      () => {
        sendResponse({ message: "confirmed", hash: issue.hash });
      }
    );
  });
};

const updateIssueInfo = (issue: Issue, sendResponse: (response: any) => void) => {
  chrome.storage.local.get("fundedIssues", (data) => {
    if (chrome.runtime.lastError) {
      sendResponse({
        message: "fail",
      });

      return;
    }
    const fundedIssues = data.fundedIssues;
    const issueIndex = fundedIssues.findIndex((_issue: Issue) => {
      return _issue.repo === issue.repo && _issue.title === issue.title && _issue.org === issue.org
    });
    console.log("issue", issueIndex);
    if (issueIndex >= 0) {
      fundedIssues.splice(issueIndex, 1);
      fundedIssues.push(issue);
      chrome.storage.local.set(
        {
          fundedIssues: fundedIssues,
        },
        () => {
          if (sendResponse) {
            sendResponse({
              message: "issue_updated",
              issue: issue,
            });
          }
        }
      );
    } else {
      sendResponse({
        message: "not_found",
      });
    }
  });
};

chrome.runtime.onInstalled.addListener(() => {
  // chrome.storage.local.get("fundedIssues", (data) => {
  // });
  // chrome.storage.local.remove('fundedIssuesTest', (resp) => console.log(resp))
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('request', request)
  if (request.message === "get_issue_funding") {
    chrome.storage.local.get("fundedIssues", (data) => {
      if (chrome.runtime.lastError) {
        sendResponse({
          message: "fail",
        });

        return;
      }
      const fundedIssues = data.fundedIssues;
      console.log(fundedIssues, request);
      const issueInfo = fundedIssues.find((issue: Issue) => {
        return (
          issue.repo === request.repo && issue.org === request.org &&
          (issue.title === request.title ||
            issue.issueNumber === request.issueNumber)
        );
      });
      console.log(issueInfo);
      if (issueInfo) {
        sendResponse({
          message: "success",
          issue: issueInfo,
        });
      } else {
        sendResponse({
          message: "not_found",
        });
      }
    });

    return true;
  } else if (request.message === "update_issue_info") {
    console.log("update", request);
    updateIssueInfo(request.issue, sendResponse);

    return true;
  } else if (request.message === "fund_issue") {
    chrome.runtime.onConnect.addListener(function (port) {
      console.assert(port.name === "popup");
      port.onMessage.addListener(function (msg) {
        console.log('port', msg)
        if (msg.request === "funding_data") {
          port.postMessage({
            request: "issue_info",
            issue: request.issue,
            popupType: "fund",
          });
        } else if (msg.request === "confirmed") {
          setIssueFundingInitial(msg.issue, sendResponse);
        }
      });
    });
    chrome.windows.create(WINDOW_LAYOUT)

    return true;
  } else if (request.message === "set_pull_request_split") {
    chrome.runtime.onConnect.addListener(function (port) {
      console.assert(port.name === "popup");
      port.onMessage.addListener(function (msg) {
        if (msg.request === "funding_data") {
          port.postMessage({
            request: "issue_info",
            issue: request.issue,
            popupType: "split",
          });
        } else if (msg.request === "funding_split") {
          updateIssueInfo(msg.issue, sendResponse);
        }
      });
    });
    chrome.windows.create(WINDOW_LAYOUT);

    return true;
  } else if (request.message === "distribute_pull_request_split") {
    chrome.runtime.onConnect.addListener(function (port) {
      console.assert(port.name === "popup");
      port.onMessage.addListener(function (msg) {
        if (msg.request === "funding_data") {
          port.postMessage({
            request: "issue_info",
            issue: request.issue,
            popupType: "distribute",
          });
        } else if (msg.request === "funds_distributed") {
          updateIssueInfo(msg.issue, sendResponse);
        }
      });
    });
    chrome.windows.create(WINDOW_LAYOUT);

    return true;
  } else if (request.message === "get_issues") {
    chrome.storage.local.get("fundedIssues", (data) => {
      if (chrome.runtime.lastError) {
        sendResponse({
          message: "fail",
        });

        return;
      }
      const fundedIssues = data.fundedIssues;
      sendResponse({
        message: "success",
        issues: fundedIssues,
      });
    });

    return true;
  }
});


chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
  console.log('sending page update')
  chrome.tabs.sendMessage(details.tabId, {message: 'page_update'})
});