import { Dispatch, FC, SetStateAction, useState } from "react";
import Image from "next/image";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import ActionsCardBanner from "./ActionsCardBanner";
import ApplicantProfileCard from "./ApplicantProfileCard";
import { Lock, X } from "lucide-react";
import { motion } from "framer-motion";
import { MAX_SHORTLIST, smallClickAnimation } from "@/src/constants";
import { BountyUserType } from "@/prisma/queries/bounty";
import { api, updateList } from "@/src/utils";
import { BOUNTY_USER_RELATIONSHIP, BountyState } from "@/types";
import toast from "react-hot-toast";
import { QuestActionView } from "./QuestActions";
import { cancelFFA, voteToCancelFFA } from "@/escrow/adapters";
import { PublicKey } from "@solana/web3.js";
import AlertCardModal from "./AlertCardModal";

export enum EApplicantsView {
  All,
  Individual,
}

interface Props {
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>;
  selectedSubmitter: BountyUserType | null;
  setSelectedSubmitter: Dispatch<SetStateAction<BountyUserType | null>>;
}

const ApplicantsView: FC<Props> = ({
  setCurrentActionView,
  selectedSubmitter,
  setSelectedSubmitter,
}) => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();
  const { currentBounty, setCurrentBounty } = useBounty();
  const { mutateAsync: updateBounty } = api.bountyUsers.update.useMutation();

  const [currentApplicantsView, setCurrentApplicantsView] =
    useState<EApplicantsView>(EApplicantsView.All);
  const [isLoading, setIsLoading] = useState(false);
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const createdAtDate = new Date(
    Number(currentBounty?.createdAt)
  ).toLocaleDateString();

  const confirmAction = (): Promise<void> => {
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
            Are you sure you want to cancel the Quest?
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

  const handleReject = async () => {
    if (!currentBounty || !selectedSubmitter) return;
    setIsLoading(true);
    const toastId = toast.loading("Submitting rejection...");

    const newRelations = [BOUNTY_USER_RELATIONSHIP.DeniedLancer];
    try {
      const updatedBounty = await updateBounty({
        bountyId: currentBounty?.id,
        currentUserId: currentUser.id,
        userId: selectedSubmitter.userid,
        relations: newRelations,
        publicKey: selectedSubmitter.publicKey,
        escrowId: currentBounty?.escrowid,
        signature: "n/a",
        label: "deny-submitter",
      });

      setCurrentBounty(updatedBounty);
      setSelectedSubmitter(null);
      toast.success("Rejection submitted", { id: toastId });
    } catch (error) {
      if (
        (error.message as string).includes(
          "Wallet is registered to another user"
        )
      ) {
        toast.error("Wallet is registered to another user", { id: toastId });
      } else {
        toast.error("Error submitting rejection", { id: toastId });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageShortlist = async (action: "add" | "remove") => {
    if (!currentBounty || !selectedSubmitter) return;

    setIsLoading(true);
    const toastId = toast.loading(
      action === "add" ? "Adding to shortlist..." : "Removing from shortlist..."
    );
    try {
      const newRelations =
        action === "add"
          ? [BOUNTY_USER_RELATIONSHIP.ShortlistedLancer]
          : [BOUNTY_USER_RELATIONSHIP.RequestedLancer];
      const updatedBounty = await updateBounty({
        bountyId: currentBounty?.id,
        currentUserId: currentUser.id,
        userId: selectedSubmitter.userid,
        relations: newRelations,
        publicKey: selectedSubmitter.publicKey,
        escrowId: currentBounty?.escrowid,
        signature: "n/a",
        label: action === "add" ? "add-to-shortlist" : "remove-from-shortlist",
      });

      setCurrentBounty(updatedBounty);
      setSelectedSubmitter(null);
      toast.success(
        action === "add"
          ? "Successfully added to shortlist"
          : "Successfully removed from shortlist",
        { id: toastId }
      );
    } catch (error) {
      if (
        (error.message as string).includes(
          "Wallet is registered to another user"
        )
      ) {
        toast.error("Wallet is registered to another user", { id: toastId });
      } else {
        toast.error(
          action === "add"
            ? "Error adding to shortlist"
            : "Error removing from shortlist",
          { id: toastId }
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoteToCancel = async () => {
    await confirmAction();
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
    await confirmAction();
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

  if (!currentBounty || !currentBounty.isCreator) return null;

  if (
    currentApplicantsView === EApplicantsView.Individual &&
    !!selectedSubmitter
  )
    return (
      <div className="flex flex-col">
        <div className="w-full flex flex-col">
          {/* banner */}
          <div
            className="w-full h-[68px] bg-white flex items-center 
            justify-between px-6 border-b border-neutral200"
          >
            <div className="flex items-center gap-2">
              <Image
                src={selectedSubmitter.user.picture}
                alt="user avatar"
                width={40}
                height={40}
                className="rounded-full overflow-hidden"
              />
              <div className="flex flex-col">
                <h1 className="text-neutral600">
                  {selectedSubmitter.user.name}
                </h1>
                {/* <p className="text text-neutral400">{selectedSubmitter.user.industries}</p> */}
                <p className="text text-neutral400">{`Engineering`}</p>
              </div>
            </div>
            <motion.button
              onClick={() => {
                setCurrentApplicantsView(EApplicantsView.All);
                setSelectedSubmitter(null);
              }}
              {...smallClickAnimation}
            >
              <X height={24} width={24} />
            </motion.button>
          </div>
        </div>
        <div className="flex flex-col gap-6 px-6 py-4">
          <div className="flex flex-col gap-5">
            <p className="text-xs text-neutral600">Previously worked with</p>
            <p className="text-xs text-neutral600">Notable skills</p>
          </div>
          <div className="w-full h-[100px] bg-neutral100 rounded-md p-6">
            Quote goes here
          </div>
          <div className="flex flex-col gap-2.5">
            <p className="text-neutral600 title-text">{`About ${selectedSubmitter.user.name}`}</p>
            <p className="text">{selectedSubmitter.user.bio}</p>
          </div>
          <div className="flex flex-col gap-2.5">
            <p className="text-neutral600 title-text">{`Why is ${selectedSubmitter.user.name} a good fit?`}</p>
            <p className="text">{selectedSubmitter.applicationText}</p>
          </div>
          {/* action buttons */}
          {!selectedSubmitter.relations.includes(
            BOUNTY_USER_RELATIONSHIP.DeniedLancer
          ) &&
          !selectedSubmitter.relations.includes(
            BOUNTY_USER_RELATIONSHIP.ShortlistedLancer
          ) ? (
            <div className="w-full flex items-center justify-end gap-4">
              <motion.button
                {...smallClickAnimation}
                className="bg-white border border-neutral200 h-9 w-fit px-4 py-2
                  title-text rounded-md text-error disabled:cursor-not-allowed disabled:opacity-80"
                onClick={handleReject}
                disabled={isLoading || isAwaitingResponse}
              >
                Reject this quote
              </motion.button>
              <motion.button
                {...smallClickAnimation}
                className="bg-primary200 border border-neutral200 h-9 w-fit px-4 py-2
                      title-text rounded-md text-white disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => handleManageShortlist("add")}
                disabled={
                  isLoading ||
                  isAwaitingResponse ||
                  currentBounty.shortlistedLancers.length === MAX_SHORTLIST
                }
              >
                {`${
                  currentBounty.shortlistedLancers.length === MAX_SHORTLIST
                    ? "Shortlist full"
                    : `Add to shortlist`
                }`}
              </motion.button>
            </div>
          ) : null}
          {/* applicant is shortlisted but client has not funded escrow with deposit */}
          {selectedSubmitter.relations.includes(
            BOUNTY_USER_RELATIONSHIP.ShortlistedLancer
          ) && Number(currentBounty.escrow.amount) === 0 ? (
            <div className="w-full flex items-center justify-end gap-4">
              <motion.button
                {...smallClickAnimation}
                className="bg-white border border-neutral200 h-9 w-fit px-4 py-2
                title-text rounded-md text-error disabled:cursor-not-allowed disabled:opacity-80"
                onClick={() => handleManageShortlist("remove")}
                disabled={isLoading || isAwaitingResponse}
              >
                Remove from shortlist
              </motion.button>
            </div>
          ) : null}
          {/* applicant is shortlisted and client has funded escrow with deposit */}
          {selectedSubmitter.relations.includes(
            BOUNTY_USER_RELATIONSHIP.ShortlistedLancer
          ) && Number(currentBounty.escrow.amount) > 0 ? (
            <div className="w-full flex items-center justify-end gap-4">
              <motion.button
                {...smallClickAnimation}
                onClick={() => {
                  setCurrentActionView(QuestActionView.Chat);
                }}
                className="bg-white border border-neutral200 px-4 py-2 rounded-md flex items-center gap-2"
              >
                <p className="text-neutral600 title-text">Chat</p>
                <svg
                  width="6"
                  height="6"
                  viewBox="0 0 8 8"
                  fill="none"
                  className="animate-pulse"
                >
                  <circle cx="4" cy="4" r="4" fill="#10966D" />
                </svg>
              </motion.button>
              <motion.button
                {...smallClickAnimation}
                className="bg-white border border-neutral300 h-9 w-fit px-4 py-2
                title-text rounded-md text-neutral600 disabled:cursor-not-allowed disabled:opacity-80"
                // onClick={() => handleManageShortlist("remove")}
                disabled={isLoading || isAwaitingResponse}
              >
                Reject for the Quest
              </motion.button>
              <motion.button
                {...smallClickAnimation}
                className="bg-success h-9 w-fit px-4 py-2
                title-text rounded-md text-white disabled:cursor-not-allowed disabled:opacity-80"
                // onClick={() => handleManageShortlist("remove")}
                disabled={isLoading || isAwaitingResponse}
              >
                Select for the Quest
              </motion.button>
            </div>
          ) : null}
        </div>
      </div>
    );

  return (
    <div className="flex flex-col">
      <ActionsCardBanner
        title="Applications Review"
        subtitle={`Started on ${createdAtDate}`}
      />
      <div className="relative flex flex-col gap-5 px-6 py-4">
        {currentBounty.shortlistedLancers.length > 0 ? (
          <>
            {Number(currentBounty.escrow.amount) === 0 ? (
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-neutral-600">
                  {`You've added ${currentBounty.shortlistedLancers.length}/${MAX_SHORTLIST} candidates to your shortlist.`}
                </p>
                <motion.button
                  {...smallClickAnimation}
                  className="bg-secondary200 text-white title-text px-4 py-2 rounded-md"
                  onClick={() => setShowModal(true)}
                >
                  Proceed with Shortlist
                </motion.button>
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <p className="title-text">Shortlist</p>
              {Number(currentBounty.escrow.amount) > 0 && <Lock size={14} />}
            </div>
            {currentBounty.shortlistedLancers.map((submitter, index) => {
              return (
                <div
                  className={`w-full pb-5 ${
                    index !== currentBounty.shortlistedLancers.length - 1
                      ? "border-b border-neutral200"
                      : ""
                  }`}
                  key={index}
                >
                  <ApplicantProfileCard
                    user={submitter}
                    setSelectedSubmitter={setSelectedSubmitter}
                    setCurrentApplicantsView={setCurrentApplicantsView}
                    setCurrentActionView={setCurrentActionView}
                  />
                </div>
              );
            })}
          </>
        ) : (
          <p className="text-sm text-neutral-600">
            You haven&apos;t answered any applicants yet. Shortlist up to 5
            profiles to move on.
          </p>
        )}
        {Number(currentBounty.escrow.amount) === 0 ? (
          <>
            <p className="title-text">Pending</p>
            {currentBounty.requestedLancers.length > 0 ? (
              currentBounty.requestedLancers.map((submitter, index) => {
                return (
                  <div
                    className={`w-full pb-5 ${
                      index !== currentBounty.requestedLancers.length - 1
                        ? "border-b border-neutral200"
                        : ""
                    }`}
                    key={index}
                  >
                    <ApplicantProfileCard
                      user={submitter}
                      setSelectedSubmitter={setSelectedSubmitter}
                      setCurrentApplicantsView={setCurrentApplicantsView}
                      setCurrentActionView={setCurrentActionView}
                    />
                  </div>
                );
              })
            ) : (
              <p className="text-neutral500 text pb-5">No pending applicants</p>
            )}
          </>
        ) : null}
        {currentBounty.deniedLancers.length > 0 ? (
          <>
            <p className="title-text">Denied</p>
            {currentBounty.deniedLancers.map((submitter, index) => {
              return (
                <div
                  className={`w-full pb-5 opacity-70 ${
                    index !== currentBounty.deniedLancers.length - 1
                      ? "border-b border-neutral200"
                      : ""
                  }`}
                  key={index}
                >
                  <ApplicantProfileCard
                    user={submitter}
                    setSelectedSubmitter={setSelectedSubmitter}
                    setCurrentApplicantsView={setCurrentApplicantsView}
                    setCurrentActionView={setCurrentActionView}
                  />
                </div>
              );
            })}
          </>
        ) : null}
        <div className="w-full flex items-center justify-end">
          {currentBounty.state === BountyState.VOTING_TO_CANCEL ? (
            <motion.button
              {...smallClickAnimation}
              className="bg-white border border-neutral200 h-9 w-fit px-4 py-2
              title-text rounded-md text-error disabled:cursor-not-allowed disabled:opacity-80"
              onClick={handleCancel}
              disabled={isLoading || isAwaitingResponse}
            >
              Cancel Quest
            </motion.button>
          ) : null}
          {currentBounty.state !== BountyState.VOTING_TO_CANCEL &&
          currentBounty.state !== BountyState.CANCELED ? (
            <motion.button
              {...smallClickAnimation}
              className="bg-white border border-neutral200 h-9 w-fit px-4 py-2
              title-text rounded-md text-error disabled:cursor-not-allowed disabled:opacity-80"
              onClick={handleVoteToCancel}
              disabled={isLoading || isAwaitingResponse}
            >
              Vote to Cancel
            </motion.button>
          ) : null}
          {currentBounty.state === BountyState.CANCELED ? (
            <motion.button
              {...smallClickAnimation}
              className="bg-white border border-neutral200 h-9 w-fit px-4 py-2
              title-text rounded-md text-error disabled:cursor-not-allowed disabled:opacity-80"
              onClick={handleVoteToCancel}
              disabled={true}
            >
              Quest Canceled
            </motion.button>
          ) : null}
        </div>
        {showModal && <AlertCardModal setShowModal={setShowModal} />}
      </div>
    </div>
  );
};

export default ApplicantsView;
