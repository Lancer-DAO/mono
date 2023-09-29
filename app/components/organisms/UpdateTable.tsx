import { useUserWallet } from "@/src/providers";
import dayjs from "dayjs";
import { DisputeModal, UpdateTableItem } from "..";

import {
  getUnreadMessageCount,
  getUnreadChannels,
  UnreadMessage,
} from "@/src/utils/sendbird";
import { useEffect, useState } from "react";
import { api, updateList } from "@/src/utils";
import {
  getApplicationTypeFromLabel,
  UpdateItemProps,
  UpdateType,
} from "../molecules/UpdateTableItem";
import { useBounty } from "@/src/providers/bountyProvider";
import { BountyState, BOUNTY_USER_RELATIONSHIP } from "@/types";
import { ADMIN_WALLETS, smallClickAnimation } from "@/src/constants";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { PublicKey } from "@solana/web3.js";
import { cancelFFA, voteToCancelFFA } from "@/escrow/adapters";
import EmptyUpdatesHistory from "../@icons/EmptyUpdatesHistory";

const AllUpdatesTable: React.FC = () => {
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
  const { data: disputes } = api.bountyUsers.getDisputesClient.useQuery(
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
    if (currentUser) {
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
                questId: application.bounty.id,
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
                questId: application.bounty.id,
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
              type: "cancel" as any,
              subType: action.type,
              time: dayjs(action.timestamp),
              extraProps: {
                questName: cancelVote.bounty.title,
                questId: cancelVote.bounty.id,
              },
              key: action.timestamp,
            });
          });
        });
        const disputeUpdates = [];
        disputes?.forEach((dispute) => {
          if (dispute.actions.length === 0) return;
          dispute.actions.forEach((action) => {
            disputeUpdates.push({
              type: "cancel" as any,
              subType: action.type,
              time: dayjs(action.timestamp),
              extraProps: {
                questName: dispute.bounty.title,
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
              questId: clientUpdate.bounty.id,
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
              questId: lancerUpdate.bounty.id,
              description: lancerUpdate.review,
              updateName: lancerUpdate.name,
            },
            key: lancerUpdate.reviewedAt,
          });
        });
        const messageUpdates = unreadMessages ? unreadMessages : [];
        const allUpdates: UpdateItemProps[] = [
          ...messageUpdates,
          ...newApplicationUpdates,
          ...newApplicationReviewsUpdates,
          ...cancelVotesUpdates,
          ...disputeUpdates,
          ...clientQuestUpdates,
          ...lancerQuestUpdates,
        ];
        allUpdates.sort((a, b) => {
          return b.time.unix() - a.time.unix();
        });
        console.log("allUpdates", allUpdates);
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
    disputes,
  ]);
  console.log('ALL UPDATES')
  console.log(allUpdates);
  if (!allUpdates) {
    return <EmptyUpdatesHistory width='612px' height='423px'/>;
  } 

  return (
    currentUser && (
      <div className="flex flex-col w-full border-solid border bg-white border-neutralBorder500 rounded-lg">
        <div className="px-8 py-4 text-black">Updates History</div>
        {allUpdates?.map((update) => {
          return <UpdateTableItem {...update} key={update.key} />;
        })}

        <div className="px-8 py-4 text-black"></div>
      </div>
    )
  );
};

const QuestUpdatesTable: React.FC = () => {
  const { currentBounty, setCurrentBounty } = useBounty();
  const [unreadMessages, setUnreadMessages] = useState<UpdateItemProps[]>(null);
  const [allUpdates, setAllUpdates] = useState<UpdateItemProps[]>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const { mutateAsync: updateBounty } = api.bountyUsers.update.useMutation();
  const { currentUser, currentWallet, program, provider } = useUserWallet();

  const [isLoading, setIsLoading] = useState(false);
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
  const { data: newApplications } =
    api.bountyUsers.getBountyUpdatesCreator.useQuery(
      { bountyids: [currentBounty.id] },
      {
        enabled: !!currentUser && !!currentBounty && currentBounty.isCreator,
      }
    );
  const { data: newApplicationReviews } =
    api.bountyUsers.getBountyUpdatesLancer.useQuery(
      { bountyids: [currentBounty.id] },
      {
        enabled: !!currentUser,
      }
    );

  const { data: cancelVotes } = api.bountyUsers.getCancelVotesLancer.useQuery(
    { bountyids: [currentBounty.id] },

    { enabled: !!currentUser && !!currentBounty && !currentBounty.isCreator }
  );

  const { data: disputes } = api.bountyUsers.getDisputesClient.useQuery(
    { bountyids: [currentBounty.id] },

    { enabled: !!currentUser && !!currentBounty && currentBounty.isCreator }
  );

  const { data: clientUpdates } = api.update.getQuestUpdatesClient.useQuery(
    { bountyids: [currentBounty.id] },

    { enabled: !!currentUser && !!currentBounty && currentBounty.isCreator }
  );

  const { data: lancerUpdates } = api.update.getQuestUpdatesLancer.useQuery(
    { bountyids: [currentBounty.id] },

    { enabled: !!currentUser && !!currentBounty && !currentBounty.isCreator }
  );

  useEffect(() => {
    if (currentUser && !unreadMessages) {
      const getChannels = async () => {
        const userIds = currentBounty.all.map((user) => user.userid);
        const unreadChannels = await getUnreadChannels(String(currentUser.id));
        const filteredMessages = unreadChannels.filter((message) => {
          return currentBounty.isCreator
            ? userIds.includes(message.userId)
            : (message.userId as number) ===
                (currentBounty.creator.userid as number);
        });
        const messageUpdates = filteredMessages.map((message) => {
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
  }, [currentUser, unreadMessages, currentBounty]);

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
              type: "cancel" as any,
              subType: action.type,
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

        const disputeUpdates = [];
        disputes?.forEach((dispute) => {
          if (dispute.actions.length === 0) return;
          dispute.actions.forEach((action) => {
            disputeUpdates.push({
              type: "cancel" as any,
              subType: action.type,
              time: dayjs(action.timestamp),
              extraProps: {
                questName: dispute.bounty.title,
              },
              key: action.timestamp,
            });
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
          ...disputeUpdates,
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
    disputes,
  ]);
  console.log('ALL UPDATES')
  console.log(allUpdates);
  if (!allUpdates) {
    return <EmptyUpdatesHistory width='612px' height='423px' />;
  }

  const confirmAction = (confirmText: string): Promise<void> => {
    setIsAwaitingResponse(true);

    return new Promise<void>((resolve, reject) => {
      const handleYes = () => {
        toast.dismiss(toastId);
        setIsAwaitingResponse(false);
        resolve();
      };

      const handleNo = () => {
        toast.dismiss(toastId);
        setIsAwaitingResponse(false);
        reject();
      };

      const toastId = toast(
        (t) => (
          <div>
            {confirmText}
            <div className="mt-2 flex items-center gap-4 justify-center">
              <button
                onClick={handleYes}
                className="bg-white border border-neutral300 text-error flex title-text
                items-center justify-center rounded-md px-3 py-1"
              >
                Yes
              </button>
              <button
                onClick={handleNo}
                className="bg-primary200 flex text-white title-text
                items-center justify-center rounded-md px-3 py-1"
              >
                No
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
        }
      );
    });
  };

  const handleVoteToCancel = async () => {
    await confirmAction("Are you sure you want to submit a vote to cancel?");
    const toastId = toast.loading("Submitting vote to cancel...");
    try {
      setIsLoading(true);
      let signature = "";
      if (currentBounty?.isCreator || currentBounty?.isCurrentSubmitter) {
        signature = await voteToCancelFFA(
          new PublicKey(currentBounty?.creator.publicKey),
          new PublicKey(currentWallet.publicKey),
          currentBounty?.escrow,
          currentWallet,
          program,
          provider
        );
      }
      const newRelations = updateList(
        currentBounty?.currentUserRelationsList,
        [],
        [BOUNTY_USER_RELATIONSHIP.VotingCancel]
      );
      const updatedBounty = await updateBounty({
        bountyId: currentBounty?.id,
        currentUserId: currentUser.id,
        userId: currentUser.id,
        relations: newRelations,
        state: BountyState.VOTING_TO_CANCEL,
        publicKey: currentWallet.publicKey.toString(),
        escrowId: currentBounty?.escrowid,
        signature,
        label: "vote-to-cancel",
      });
      setCurrentBounty(updatedBounty);
      toast.success("Successfully voted to cancel", { id: toastId });
    } catch (error) {
      if (
        (error.message as string).includes(
          "Wallet is registered to another user"
        )
      ) {
        toast.error("Wallet is registered to another user", { id: toastId });
      } else {
        toast.error("Error submitting application", { id: toastId });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    await confirmAction("Are you sure you want to cancel this quest?");
    const toastId = toast.loading("Cancelling Quest...");
    try {
      setIsLoading(true);
      const signature = await cancelFFA(
        currentBounty.escrow,
        currentWallet,
        program,
        provider
      );
      const newRelation = updateList(
        currentBounty.currentUserRelationsList,
        [],
        [BOUNTY_USER_RELATIONSHIP.Canceler]
      );
      const updatedBounty = await updateBounty({
        bountyId: currentBounty.id,
        currentUserId: currentUser.id,
        userId: currentUser.id,
        relations: newRelation,
        state: BountyState.CANCELED,
        publicKey: currentWallet.publicKey.toString(),
        escrowId: currentBounty.escrowid,
        signature,
        label: "cancel-escrow",
      });

      setCurrentBounty(updatedBounty);
      setIsLoading(false);
      toast.success("Quest canceled", { id: toastId });
    } catch (error) {
      if (
        (error.message as string).includes(
          "Wallet is registered to another user"
        )
      ) {
        toast.error("Wallet is registered to another user", { id: toastId });
      } else {
        toast.error("Error cancelling Quest", { id: toastId });
      }
    }
  };

  const handleStartDispute = async () => {
    await confirmAction("Are you sure you want to start a dispute?");
    const toastId = toast.loading("Initiating Dispute...");
    try {
      setIsLoading(true);
      const newRelation = updateList(
        currentBounty.currentUserRelationsList,
        [],
        [BOUNTY_USER_RELATIONSHIP.Disputer]
      );
      const updatedBounty = await updateBounty({
        bountyId: currentBounty.id,
        currentUserId: currentUser.id,
        userId: currentUser.id,
        relations: newRelation,
        state: BountyState.DISPUTE_STARTED,
        publicKey: currentWallet.publicKey.toString(),
        escrowId: currentBounty.escrowid,
        signature: "",
        label: "start-dispute",
      });

      setCurrentBounty(updatedBounty);
      setIsLoading(false);
      toast.success("Dispute Initiated", { id: toastId });
    } catch (error) {
      if (
        (error.message as string).includes(
          "Wallet is registered to another user"
        )
      ) {
        toast.error("Wallet is registered to another user", { id: toastId });
      } else {
        toast.error("Error initiating Dispute", { id: toastId });
      }
    }
  };

  return (
    currentUser && (
      <div className="flex flex-col w-full border-solid border bg-white border-neutralBorder500 rounded-lg">
        <div className="flex items-center">
          <div className="px-8 py-4 text-black">Updates History</div>

          {currentBounty.isCreator &&
            currentBounty.state !== BountyState.VOTING_TO_CANCEL &&
            currentBounty.state !== BountyState.DISPUTE_STARTED &&
            currentBounty.state !== BountyState.DISPUTE_SETTLED && (
              <motion.button
                {...smallClickAnimation}
                className="bg-white border border-neutral200 ml-auto mr-8 h-9 w-fit px-4 py-2
              title-text rounded-md text-error disabled:cursor-not-allowed disabled:opacity-80"
                onClick={handleVoteToCancel}
                disabled={isLoading || isAwaitingResponse}
              >
                Vote to Cancel
              </motion.button>
            )}
          {!currentBounty.isCreator &&
            currentBounty.state === BountyState.VOTING_TO_CANCEL &&
            currentBounty.needsToVote
              .map((user) => user.userid)
              .includes(currentUser.id) && (
              <>
                <motion.button
                  {...smallClickAnimation}
                  className="bg-white border border-neutral200 ml-auto mr-4 h-9 w-fit px-4 py-2
              title-text rounded-md text-error disabled:cursor-not-allowed disabled:opacity-80"
                  onClick={handleVoteToCancel}
                  disabled={isLoading || isAwaitingResponse}
                >
                  Vote to Cancel
                </motion.button>
                <motion.button
                  {...smallClickAnimation}
                  className="bg-white border border-neutral200 mr-8 h-9 w-fit px-4 py-2
              title-text rounded-md text-error disabled:cursor-not-allowed disabled:opacity-80"
                  onClick={handleStartDispute}
                  disabled={isLoading || isAwaitingResponse}
                >
                  Dispute Cancellation
                </motion.button>
              </>
            )}
          {currentBounty.state === BountyState.DISPUTE_STARTED && (
            <>
              <motion.button
                {...smallClickAnimation}
                className="ml-auto text-white bg-[#B26B9B] border-[#A66390] mr-8 h-9 w-fit px-4 py-2
              title-text rounded-md  disabled:cursor-not-allowed disabled:opacity-80"
                onClick={() => {}}
                disabled={true}
              >
                Dispute in Progress
              </motion.button>
            </>
          )}
          {currentBounty.isCreator &&
            currentBounty.state === BountyState.VOTING_TO_CANCEL &&
            currentBounty.needsToVote.length === 0 && (
              <motion.button
                {...smallClickAnimation}
                className="bg-white border border-neutral200 h-9 w-fit px-4 py-2
                title-text rounded-md text-error disabled:cursor-not-allowed disabled:opacity-80"
                onClick={handleCancel}
                disabled={isLoading || isAwaitingResponse}
              >
                Cancel Quest
              </motion.button>
            )}
          {currentUser.isAdmin &&
            currentWallet &&
            ADMIN_WALLETS.includes(currentWallet.publicKey.toString()) &&
            currentBounty.state === BountyState.DISPUTE_STARTED && (
              <motion.button
                {...smallClickAnimation}
                className="bg-white border border-neutral200 h-9 w-fit px-4 py-2 mr-8
                title-text rounded-md text-error disabled:cursor-not-allowed disabled:opacity-80"
                onClick={() => {
                  setShowDisputeModal(true);
                }}
                disabled={isLoading || isAwaitingResponse}
              >
                Settle Dispute
              </motion.button>
            )}
        </div>
        {allUpdates?.map((update) => {
          return <UpdateTableItem {...update} key={update.key} />;
        })}
        {showDisputeModal && (
          <DisputeModal setShowModal={setShowDisputeModal} />
        )}

        <div className="px-8 py-4 text-black"></div>
      </div>
    )
  );
};

const UpdateTable: React.FC<{ allUpdates?: boolean }> = ({ allUpdates }) => {
  return allUpdates ? <AllUpdatesTable /> : <QuestUpdatesTable />;
};

export default UpdateTable;
