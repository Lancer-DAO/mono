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
import { ChatButton, FundQuestModal } from "@/components";
import { useReferral } from "@/src/providers/referralProvider";
import DepositCTAModal from "./DepositCTAModal";
import IndividualApplicantView from "./IndividualApplicantView";

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
  api.quote.getHighestQuoteByBounty.useQuery(
    {
      bountyId: currentBounty.id,
    },
    {
      enabled: !!currentBounty,
      onSuccess: (data) => {
        const tempDepositAmount = data * 0.05;
        setDepositAmount(Math.floor(tempDepositAmount * 100) / 100);
      },
    }
  );

  const [currentApplicantsView, setCurrentApplicantsView] =
    useState<EApplicantsView>(EApplicantsView.All);
  const [isLoading, setIsLoading] = useState(false);
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);

  const createdAtDate = new Date(
    Number(currentBounty?.createdAt)
  ).toLocaleDateString();

  const confirmAction = (action: string): Promise<void> => {
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
            <p className="text-center">{`Are you sure you want to ${action}?`}</p>
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
    await confirmAction("vote to cancel the Quest");
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
      console.log(error);
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
    await confirmAction("cancel the Quest");
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
      <IndividualApplicantView
        selectedSubmitter={selectedSubmitter}
        setSelectedSubmitter={setSelectedSubmitter}
        setCurrentApplicantsView={setCurrentApplicantsView}
        setCurrentActionView={setCurrentActionView}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        isAwaitingResponse={isAwaitingResponse}
        setIsAwaitingResponse={setIsAwaitingResponse}
        depositAmount={depositAmount}
      />
    );

  return (
    <>
      <div className="flex flex-col h-full">
        <ActionsCardBanner
          title="Applications Review"
          subtitle={`Started on ${createdAtDate}`}
        />
        <div className="relative flex flex-col h-full gap-5 px-6 py-4">
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
          ) : currentBounty.approvedSubmitters.length === 0 ? (
            <p className="text-sm text-neutral-600">
              You haven&apos;t answered any applicants yet. Shortlist up to 5
              profiles to move on.
            </p>
          ) : null}
          {currentBounty.approvedSubmitters.length === 0 ? (
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
                <p className="text-neutral500 text pb-5">
                  No pending applicants
                </p>
              )}
            </>
          ) : (
            <>
              <p className="title-text">Selected</p>
              {currentBounty.approvedSubmitters.map((submitter, index) => {
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
              })}
            </>
          )}

          {currentBounty.deniedLancers.length > 0 ? (
            <>
              <p className="title-text">Denied</p>
              {currentBounty.deniedLancers.map((submitter, index) => {
                return (
                  <div
                    className={`w-full pb-5 ${
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
            {currentBounty.state === BountyState.VOTING_TO_CANCEL &&
            currentBounty.isCreator ? (
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

            {currentBounty.state === BountyState.CANCELED ? (
              <motion.button
                {...smallClickAnimation}
                className="bg-white border border-neutral200 h-9 w-fit px-4 py-2
                title-text rounded-md text-error disabled:cursor-not-allowed disabled:opacity-80"
                disabled={true}
              >
                Quest Canceled
              </motion.button>
            ) : null}
          </div>
          {showModal && (
            <DepositCTAModal
              prompt="This unlocks the ability to chat with your shortlisted applicants.
              Once you decide which candidate you want to work with, we will ask you
              to deposit 100% of the funds into escrow to kick things off."
              setShowModal={setShowModal}
              setShowFundModal={setShowFundModal}
              amount={depositAmount}
            />
          )}
        </div>
      </div>
      {showFundModal && (
        <FundQuestModal
          setShowModal={setShowFundModal}
          setShowFundModal={setShowFundModal}
          amount={depositAmount}
          approving={false}
        />
      )}
    </>
  );
};

export default ApplicantsView;
