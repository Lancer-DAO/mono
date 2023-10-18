import { useEffect, useState } from "react";
import { useUserWallet } from "@/src/providers";
import dayjs from "dayjs";
import { DisputeModal, UpdateTableItem } from "..";
import { getUnreadChannels } from "@/src/utils/sendbird";
import { api, decimalToNumber, updateList } from "@/src/utils";
import {
  getApplicationTypeFromLabel,
  UpdateItemProps,
} from "../molecules/UpdateTableItem";
import { useBounty } from "@/src/providers/bountyProvider";
import { BountyState, BOUNTY_USER_RELATIONSHIP } from "@/types";
import {
  ADMIN_WALLETS,
  BADGES_PROJECT_PARAMS,
  CREATE_COMPLETION_BADGES,
  smallClickAnimation,
} from "@/src/constants";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { PublicKey } from "@solana/web3.js";
import EmptyUpdatesHistory from "../@icons/EmptyUpdatesHistory";
import {
  approveRequestFFA,
  cancelFFA,
  voteToCancelFFA,
} from "@/escrow/adapters";

import { createUnderdogClient } from "@underdog-protocol/js";
const underdogClient = createUnderdogClient({});

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

  return (
    <div className="flex flex-col w-full border-solid border bg-white border-neutralBorder500 rounded-lg">
      <div className="px-8 py-4 text-neutral600 font-bold text-lg">
        Updates History
      </div>
      <div className="h-[1px] w-full bg-neutral100" />
      {currentUser ? (
        !allUpdates || allUpdates?.length === 0 ? (
          <div className="mt-4 flex justify-center">
            <EmptyUpdatesHistory width="290px" height="154px" />
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-y-auto">
            {allUpdates.map((update) => {
              return <UpdateTableItem {...update} key={update.key} />;
            })}
          </div>
        )
      ) : (
        <div className="mt-4 flex justify-center">
          <EmptyUpdatesHistory width="290px" height="154px" />
        </div>
      )}

      <div className="px-8 py-4 text-neutral600"></div>
    </div>
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
                className=" bg-primary200 flex text-white title-text title-text
                items-center justify-center rounded-md px-3 py-1"
              >
                Yes
              </button>
              <button
                onClick={handleNo}
                className="bg-white border border-neutral300 text-error
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

      setTimeout(() => {
        toast.dismiss(toastId);
      }, 2000);
    } catch (error) {
      if (
        (error.message as string).includes(
          "Wallet is registered to another user"
        )
      ) {
        toast.error("Wallet is registered to another user", {
          id: toastId,
        });
        setTimeout(() => {
          toast.dismiss(toastId);
        }, 2000);
      } else {
        toast.error("Error submitting application", {
          id: toastId,
        });
        setTimeout(() => {
          toast.dismiss(toastId);
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handlePayoutQuest = async () => {
    await confirmAction(
      "Are you sure you want to payout this Quest in its entirety?"
    );
    const toastId = toast.loading("Paying out Quest...");
    try {
      setIsLoading(true);
      let signature = "";
      if (currentBounty?.isCreator && currentBounty.currentSubmitter) {
        signature = await approveRequestFFA(
          new PublicKey(currentBounty.currentSubmitter.publicKey),
          currentBounty?.escrow,
          currentWallet,
          program,
          provider
        );
      }
      const newRelations = updateList(
        currentBounty.currentSubmitter.relations,
        [],
        [BOUNTY_USER_RELATIONSHIP.Completer]
      );
      const updatedBounty = await updateBounty({
        bountyId: currentBounty?.id,
        currentUserId: currentUser.id,
        userId: currentBounty.currentSubmitter.userid,
        relations: newRelations,
        state: BountyState.COMPLETE,
        publicKey: currentBounty.currentSubmitter.publicKey,
        escrowId: currentBounty?.escrowid,
        signature,
        label: "complete-bounty",
      });
      setCurrentBounty(updatedBounty);
      if (CREATE_COMPLETION_BADGES && !currentBounty?.isTest) {
        const creatorKey = currentBounty?.creator.publicKey;

        const reputationIncrease =
          100 * decimalToNumber(currentBounty?.estimatedTime);

        await underdogClient.createNft({
          params: BADGES_PROJECT_PARAMS,
          body: {
            name: `Completer: ${currentBounty?.id}`,
            image:
              "https://utfs.io/f/969ce9f5-f272-444a-ac76-5b4a9e2be9d9_quest_completed.png",
            description: currentBounty?.description,
            attributes: {
              reputation: reputationIncrease,
              completed: dayjs().toISOString(),
              tags: currentBounty?.tags.map((tag) => tag.name).join(","),
              role: "completer",
            },
            upsert: false,
            receiverAddress: currentBounty.currentSubmitter.publicKey,
          },
        });

        await underdogClient.createNft({
          params: BADGES_PROJECT_PARAMS,
          body: {
            name: `Creator: ${currentBounty?.id}`,
            image:
              "https://utfs.io/f/969ce9f5-f272-444a-ac76-5b4a9e2be9d9_quest_completed.png",
            description: currentBounty?.description,
            attributes: {
              reputation: reputationIncrease,
              completed: dayjs().toISOString(),
              tags: currentBounty?.tags.map((tag) => tag.name).join(","),
              role: "creator",
            },
            upsert: false,
            receiverAddress: creatorKey,
          },
        });
      }
      toast.success("Successfully paid out", { id: toastId });
      setTimeout(() => {
        toast.dismiss(toastId);
      }, 2000);
    } catch (error) {
      if (
        (error.message as string).includes(
          "Wallet is registered to another user"
        )
      ) {
        toast.error("Wallet is registered to another user", {
          id: toastId,
        });
        setTimeout(() => {
          toast.dismiss(toastId);
        }, 2000);
      } else {
        console.error(error);
        toast.error("Error paying out bounty", { id: toastId });
        setTimeout(() => {
          toast.dismiss(toastId);
        }, 2000);
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
      setTimeout(() => {
        toast.dismiss(toastId);
      }, 2000);
    } catch (error) {
      if (
        (error.message as string).includes(
          "Wallet is registered to another user"
        )
      ) {
        toast.error("Wallet is registered to another user", {
          id: toastId,
        });
        setTimeout(() => {
          toast.dismiss(toastId);
        }, 2000);
      } else {
        toast.error("Error cancelling Quest", { id: toastId });
        setTimeout(() => {
          toast.dismiss(toastId);
        }, 2000);
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
      setTimeout(() => {
        toast.dismiss(toastId);
      }, 2000);
    } catch (error) {
      if (
        (error.message as string).includes(
          "Wallet is registered to another user"
        )
      ) {
        toast.error("Wallet is registered to another user", {
          id: toastId,
        });
        setTimeout(() => {
          toast.dismiss(toastId);
        }, 2000);
      } else {
        toast.error("Error initiating Dispute", {
          id: toastId,
        });
        setTimeout(() => {
          toast.dismiss(toastId);
        }, 2000);
      }
    }
  };

  return (
    currentUser && (
      <div className="flex flex-col w-full border-solid border bg-white border-neutralBorder500 rounded-lg">
        <div className="flex items-center justify-between px-8 py-4">
          <p className="text-neutral600 font-bold text-lg whitespace-nowrap">
            Updates History
          </p>
          <div className="flex items-center gap-3 ml-auto">
            {currentBounty.isCreator &&
              currentBounty.state !== BountyState.VOTING_TO_CANCEL &&
              currentBounty.state !== BountyState.CANCELED &&
              currentBounty.state !== BountyState.COMPLETE &&
              currentBounty.state !== BountyState.DISPUTE_STARTED &&
              currentBounty.state !== BountyState.DISPUTE_SETTLED && (
                <motion.button
                  {...smallClickAnimation}
                  className="bg-white border border-neutral200 h-9 w-fit px-4 py-2
                  title-text rounded-md text-error disabled:cursor-not-allowed disabled:opacity-80 whitespace-nowrap"
                  onClick={handleVoteToCancel}
                  disabled={isLoading || isAwaitingResponse}
                >
                  Vote to Cancel
                </motion.button>
              )}
            {currentBounty.isCreator &&
              !!currentBounty.currentSubmitter &&
              [BountyState.AWAITING_REVIEW, BountyState.IN_PROGRESS].includes(
                currentBounty.state as BountyState
              ) && (
                <motion.button
                  {...smallClickAnimation}
                  className="bg-white border border-neutral200 h-9 w-fit px-4 py-2
                  title-text rounded-md text-success disabled:cursor-not-allowed disabled:opacity-80 whitespace-nowrap"
                  onClick={handlePayoutQuest}
                  disabled={isLoading || isAwaitingResponse}
                >
                  Payout Quest
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
                    className="bg-white border border-neutral200 h-9 w-fit px-4 py-2
                    title-text rounded-md text-error disabled:cursor-not-allowed disabled:opacity-80 whitespace-nowrap"
                    onClick={handleVoteToCancel}
                    disabled={isLoading || isAwaitingResponse}
                  >
                    Vote to Cancel
                  </motion.button>
                  <motion.button
                    {...smallClickAnimation}
                    className="bg-white border border-neutral200 h-9 w-fit px-4 py-2
                    title-text rounded-md text-error disabled:cursor-not-allowed disabled:opacity-80 whitespace-nowrap"
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
                  className="ml-auto text-white bg-[#B26B9B] border-[#A66390] h-9 w-fit px-4 py-2
                  title-text rounded-md  disabled:cursor-not-allowed disabled:opacity-80 whitespace-nowrap"
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
                  title-text rounded-md text-error disabled:cursor-not-allowed disabled:opacity-80 whitespace-nowrap"
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
                  className="bg-white border border-neutral200 h-9 w-fit px-4 py-2
                  title-text rounded-md text-error disabled:cursor-not-allowed disabled:opacity-80 whitespace-nowrap"
                  onClick={() => {
                    setShowDisputeModal(true);
                  }}
                  disabled={isLoading || isAwaitingResponse}
                >
                  Settle Dispute
                </motion.button>
              )}
          </div>
        </div>
        <div className="h-[1px] w-full bg-neutral100" />

        {!allUpdates || allUpdates?.length === 0 ? (
          <div className="mt-4 flex justify-center">
            <EmptyUpdatesHistory width="270px" height="143px" />
          </div>
        ) : (
          <div className="flex flex-col max-h-[1200px] overflow-y-scroll">
            {allUpdates.map((update) => {
              return (
                <UpdateTableItem
                  {...update}
                  key={update.key}
                  isIndividual={true}
                />
              );
            })}
          </div>
        )}
        {showDisputeModal ? (
          <DisputeModal setShowModal={setShowDisputeModal} />
        ) : null}

        <div className="px-8 py-4 text-neutral600"></div>
      </div>
    )
  );
};

const UpdateTable: React.FC<{ allUpdates?: boolean }> = ({ allUpdates }) => {
  return allUpdates ? <AllUpdatesTable /> : <QuestUpdatesTable />;
};

export default UpdateTable;
