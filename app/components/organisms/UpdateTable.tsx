import { useUserWallet } from "@/src/providers";
import dayjs from "dayjs";
import { UpdateTableItem } from "..";

import {
  getUnreadMessageCount,
  getUnreadChannels,
  UnreadMessage,
} from "@/src/utils/sendbird";
import { useEffect, useState } from "react";

const UpdateTable: React.FC = () => {
  const { currentUser } = useUserWallet();
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessage[]>(null);

  useEffect(() => {
    if (currentUser && !unreadMessages) {
      console.log("getting messages");
      const getChannels = async () => {
        console.log("there");
        const unreadChannels = await getUnreadChannels(String(currentUser.id));
        console.log("hi", unreadChannels);
        setUnreadMessages(unreadChannels);
      };
      getChannels();
    }
  }, [currentUser, unreadMessages]);
  return (
    currentUser && (
      <div className="flex flex-col w-[610px] border-solid border bg-white border-neutralBorder500 rounded-lg">
        <div className="px-8 py-4 text-black">Updates History</div>
        {unreadMessages?.map((message) => {
          return (
            <UpdateTableItem
              key={message.userId}
              type="message"
              time={dayjs(message.sentAt)}
              updater={message.userName}
              extraProps={{ messageCount: message.unreadCount }}
            />
          );
        })}

        <UpdateTableItem
          type="submission"
          subType="rejected"
          time={dayjs("Tue, 19 Sep 2023 02:26:53 GMT")}
          updater={currentUser}
        />
        <UpdateTableItem
          type="submission"
          subType="accepted"
          time={dayjs("Tue, 19 Sep 2023 02:26:53 GMT")}
          updater={currentUser}
        />
        <UpdateTableItem
          type="submission"
          subType="vote-to-cancel"
          time={dayjs("Tue, 19 Sep 2023 02:26:53 GMT")}
          updater={currentUser}
        />
        <UpdateTableItem
          type="submission"
          subType="new"
          time={dayjs("Tue, 19 Sep 2023 02:26:53 GMT")}
          updater={currentUser}
        />
        <UpdateTableItem
          type="quote"
          subType="received"
          time={dayjs("Tue, 19 Sep 2023 02:26:53 GMT")}
          updater={currentUser}
        />
        <UpdateTableItem
          type="quote"
          subType="accepted"
          time={dayjs("Tue, 19 Sep 2023 02:26:53 GMT")}
          updater={currentUser}
        />
        <UpdateTableItem
          type="quote"
          subType="rejected"
          time={dayjs("Tue, 19 Sep 2023 02:26:53 GMT")}
          updater={currentUser}
        />
        <UpdateTableItem
          type="application"
          subType="applied"
          time={dayjs("Tue, 19 Sep 2023 02:26:53 GMT")}
          updater={currentUser}
        />
        <UpdateTableItem
          type="application"
          subType="shortlisted"
          time={dayjs("Tue, 19 Sep 2023 02:26:53 GMT")}
          updater={currentUser}
        />
        <UpdateTableItem
          type="application"
          subType="accepted"
          time={dayjs("Tue, 19 Sep 2023 02:26:53 GMT")}
          updater={currentUser}
        />
        <UpdateTableItem
          type="application"
          subType="denied"
          time={dayjs("Tue, 19 Sep 2023 02:26:53 GMT")}
          updater={currentUser}
        />
        <div className="px-8 py-4 text-black"></div>
      </div>
    )
  );
};
export default UpdateTable;
