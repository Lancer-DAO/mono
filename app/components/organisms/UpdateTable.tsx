import { useUserWallet } from "@/src/providers";
import dayjs from "dayjs";
import { UpdateTableItem } from "..";

import {
  getUnreadMessageCount,
  getUnreadChannels,
  UnreadMessage,
} from "@/src/utils/sendbird";
import { useEffect, useState } from "react";
import { api } from "@/src/utils";
import {
  getApplicationTypeFromLabel,
  UpdateItemProps,
  UpdateType,
} from "../molecules/UpdateTableItem";

const UpdateTable: React.FC = () => {
  const { currentUser } = useUserWallet();
  const [unreadMessages, setUnreadMessages] = useState<UpdateItemProps[]>(null);
  const [allUpdates, setAllUpdates] = useState<UpdateItemProps[]>(null);
  const { data: newApplications } =
    api.bountyUsers.getBountyUpdatesCreator.useQuery(undefined, {
      enabled: !!currentUser,
    });
  const { data: newApplicationReviews } =
    api.bountyUsers.getBountyUpdatesLancer.useQuery(undefined, {
      enabled: !!currentUser,
    });

  const { data: cancelVotes } = api.bountyUsers.getCancelVotesLancer.useQuery(
    undefined,
    {
      enabled: !!currentUser,
    }
  );

  const { data: clientUpdates } = api.update.getQuestUpdatesClient.useQuery(
    undefined,
    {
      enabled: !!currentUser,
    }
  );

  const { data: lancerUpdates } = api.update.getQuestUpdatesLancer.useQuery(
    undefined,
    {
      enabled: !!currentUser,
    }
  );

  console.log("updates", cancelVotes);
  useEffect(() => {
    if (currentUser && !unreadMessages) {
      const getChannels = async () => {
        const unreadChannels = await getUnreadChannels(String(currentUser.id));
        const messageUpdates = unreadChannels?.map((message) => {
          return {
            type: "message" as any,
            time: dayjs(message.sentAt),
            extraProps: {
              messageCount: message.unreadCount,
              updater: message.userName,
            },
            key: message.userId,
          };
        });

        setUnreadMessages(messageUpdates);
      };
      getChannels();
    }
  }, [currentUser, unreadMessages]);

  useEffect(() => {
    if (currentUser && !!unreadMessages) {
      const getChannels = async () => {
        const newApplicationUpdates = [];
        newApplications?.forEach((application) => {
          if (application.actions.length === 0) return;
          application.actions.forEach((action) => {
            newApplicationUpdates.push({
              type: "application" as any,
              subType: "applied",
              time: dayjs(action.timestamp),
              extraProps: {
                questName: application.bounty.title,
              },
              key: action.timestamp,
            });
          });
        });
        const newApplicationReviewsUpdates = [];
        newApplicationReviews?.forEach((application) => {
          if (application.actions.length === 0) return;
          application.actions.forEach((action) => {
            newApplicationReviewsUpdates.push({
              type: "application" as any,
              subType: getApplicationTypeFromLabel(action.type),
              time: dayjs(action.timestamp),
              extraProps: {
                questName: application.bounty.title,
              },
              key: action.timestamp,
            });
          });
        });
        const cancelVotesUpdates = [];
        cancelVotes?.forEach((cancelVote) => {
          if (cancelVote.actions.length === 0) return;
          cancelVote.actions.forEach((action) => {
            cancelVotesUpdates.push({
              type: "submission" as any,
              subType: "vote-to-cancel",
              time: dayjs(action.timestamp),
              extraProps: {
                questName: cancelVote.bounty.title,
              },
              key: action.timestamp,
            });
          });
        });

        const clientQuestUpdates = [];
        clientUpdates?.forEach((clientUpdate) => {
          clientQuestUpdates.push({
            type: "submission" as any,
            subType: "new",
            time: dayjs(clientUpdate.createdAt),
            extraProps: {
              questName: clientUpdate.bounty.title,
              description: clientUpdate.description,
            },
            key: clientUpdate.createdAt,
          });
        });
        const lancerQuestUpdates = [];
        lancerUpdates?.forEach((lancerUpdate) => {
          lancerQuestUpdates.push({
            type: "submission" as any,
            subType: lancerUpdate.state,
            time: dayjs(lancerUpdate.reviewedAt),
            extraProps: {
              questName: lancerUpdate.bounty.title,
              description: lancerUpdate.review,
              updateName: lancerUpdate.name,
            },
            key: lancerUpdate.reviewedAt,
          });
        });
        const allUpdates: UpdateItemProps[] = [
          ...unreadMessages,
          ...newApplicationUpdates,
          ...newApplicationReviewsUpdates,
          ...cancelVotesUpdates,
          ...clientQuestUpdates,
          ...lancerQuestUpdates,
        ];
        allUpdates.sort((a, b) => {
          return b.time.unix() - a.time.unix();
        });
        setAllUpdates(allUpdates);
      };
      getChannels();
    }
  }, [
    unreadMessages,
    newApplications,
    newApplicationReviews,
    cancelVotes,
    currentUser,
    clientUpdates,
    lancerUpdates,
  ]);

  return (
    currentUser && (
      <div className="flex flex-col w-[710px] border-solid border bg-white border-neutralBorder500 rounded-lg">
        <div className="px-8 py-4 text-black">Updates History</div>
        {allUpdates?.map((update) => {
          return <UpdateTableItem {...update} key={update.key} />;
        })}

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
        <div className="px-8 py-4 text-black"></div>
      </div>
    )
  );
};
export default UpdateTable;
