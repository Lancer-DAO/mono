import axios from "axios";
import { uuid4 } from "@sentry/utils";

const data = {
  data: {
    note: "this is a test",
    id: 123123123,
    other_id: 1231231123,
  },
  version: "1.0",
  event_type: "bounty.created",
  event_id: "023f6e7860b4bdb95f8a",
};

const headers = {
  Authorization: "Bearer AogdsatNNuWuNTijh5F9tmYM",
  "Content-Type": "application/json",
};

const url =
  "https://hostedhooks.com/api/v1/apps/2061294f-21b3-4e92-90eb-38388ec53d64/messages";

export const HostedHooksClient = {
  sendWebhook: (
    requestData: any,
    event_type: string,
    timestamp: string = Date.now().toString()
  ) => {
    const webhookData = JSON.stringify(requestData);
    console.log("webhookData", webhookData);

    const data = {
      data: webhookData,

      version: "1.0",
      event_type: event_type,
      event_id: timestamp,
    };
    axios
      .post(url, data, { headers })
      .then((response) => {})
      .catch((error) => {
        console.error("Error:", error);
      });
  },
};
