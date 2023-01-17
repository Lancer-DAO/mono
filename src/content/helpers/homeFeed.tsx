import * as ReactDOM from "react-dom/client";
import { BountyFeed } from "@/components";
const LIST_ITEM_ID = "bounty-list-item";

export const insertHomeFeed = () => {
  const existingWrapper = window.document.getElementById(LIST_ITEM_ID);
  console.log("existing", existingWrapper);
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
        chrome.runtime.sendMessage(
          {
            message: "get_issues",
            data: {
              filters: ["open"],
            },
          },
          (response) => {
            const footerEle = window.document.querySelector(footerSelector);
            const bodyEle = window.document.querySelector(".bounty-tab");

            if (footerEle && !bodyEle) {
              const feedItem = window.document.createElement("div");
              feedItem.className = "feed-wrapper";
              footerEle.insertAdjacentElement("beforebegin", feedItem);
              const feedInner = ReactDOM.createRoot(feedItem);
              feedInner.render(<BountyFeed issues={response.issues} />);
            }
          }
        );
      }}
    >
      <span data-view-component="true"> Bounties</span>
    </button>
  );

  const feedEle = window.document.querySelector('[aria-label="Your Feeds"]');

  if (feedEle) {
    const listItem = window.document.createElement("li");
    listItem.className = `d-inline-flex`;
    listItem.role = "presentation";
    listItem.setAttribute("data-view-component", "true");
    listItem.id = LIST_ITEM_ID;
    feedEle.appendChild(listItem);
    const listInner = ReactDOM.createRoot(listItem);
    listInner.render(buttonEle);
  }
};
