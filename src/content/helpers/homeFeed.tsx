import * as ReactDOM from "react-dom/client";
import { BountyFeed } from "@/components";
import axios, { AxiosResponse } from "axios";
import {
  DATA_API_ROUTE,
  FULL_PULL_REQUEST_API_ROUTE,
  ISSUE_API_ROUTE,
  NEW_ISSUE_API_ROUTE,
} from "@/server/src/constants";
import { convertToQueryParams, getApiEndpointExtenstion } from "@/utils";
const LIST_ITEM_ID = "bounty-list-item";

const getIssues = () =>
  axios.get(
    `${getApiEndpointExtenstion()}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}s`
  );

export const insertHomeFeed = () => {
  const existingWrapper = window.document.getElementById(LIST_ITEM_ID);
  console.log("feed", existingWrapper, getApiEndpointExtenstion());
  if (existingWrapper) {
    return;
  }
  const footerSelector =
    ".d-flex.flex-items-between.footer.container-lg.my-5.px-0";

  const buttonEle = (
    <button
      data-hydro-click='{"event_type":"feeds.feed_click","payload":{"click_target":"feed.next_tab","originating_url":"https://github.com/","user_id":117492794}}'
      data-hydro-click-hmac="e0cef1b27232baedbc41728bd956018ffa3a13482bfd40d1161fb4d81d36d063"
      id="feed-next"
      type="button"
      role="tab"
      aria-controls="panel-2"
      data-view-component="true"
      className="UnderlineNav-item"
      aria-selected="false"
      tabIndex={-2}
      onClick={() => {
        getIssues().then((response) => {
          const issues = response.data.map((rawIssue) => {
            return {
              ...rawIssue,
              hash: rawIssue.funding_hash,
              amount: parseFloat(rawIssue.funding_amount),
              pullNumber: rawIssue.pull_number,
              issueNumber: rawIssue.issue_number,
              githubId: rawIssue.github_id,
              payoutHash: rawIssue.payout_hash,
              author: rawIssue.github_login,
              pubkey: rawIssue.solana_pubkey,
            };
          });
          const footerEle = window.document.querySelector(footerSelector);
          const bodyEle = window.document.querySelector(".bounty-tab");
          console.log(issues);
          if (footerEle && !bodyEle) {
            const feedItem = window.document.createElement("div");
            feedItem.className = "feed-wrapper";
            footerEle.insertAdjacentElement("beforebegin", feedItem);
            const feedInner = ReactDOM.createRoot(feedItem);
            feedInner.render(<BountyFeed issues={issues} />);
          }
        });
      }}
    >
      <span data-view-component="true"> Bounties</span>
    </button>
  );

  const feedEle = window.document.querySelector('[aria-label="Your Feeds"]');

  if (feedEle) {
    const listItem = window.document.createElement("li");
    listItem.className = `d-inline-flex`;
    listItem.setAttribute("role", "presentation");
    listItem.setAttribute("data-view-component", "true");
    listItem.id = LIST_ITEM_ID;
    feedEle.appendChild(listItem);
    const listInner = ReactDOM.createRoot(listItem);
    listInner.render(buttonEle);
  }
};
