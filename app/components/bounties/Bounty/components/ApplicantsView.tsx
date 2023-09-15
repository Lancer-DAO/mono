import { Dispatch, FC, SetStateAction, useState } from "react";
import Image from "next/image";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import ActionsCardBanner from "./ActionsCardBanner";
import ApplicantProfileCard from "./ApplicantProfileCard";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { smallClickAnimation } from "@/src/constants";
import { BountyUserType } from "@/prisma/queries/bounty";
import { api, updateList } from "@/src/utils";
import { BOUNTY_USER_RELATIONSHIP } from "@/types";
import toast from "react-hot-toast";
import { QuestActionView } from "./QuestActions";
import { approveRequestFFA } from "@/escrow/adapters";
import { PublicKey } from "@solana/web3.js";
import { useReferral } from "@/src/providers/referralProvider";

export enum EApplicantsView {
  All,
  Individual,
}

interface Props {
  currentActionView: QuestActionView;
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>;
}

const ApplicantsView: FC<Props> = ({
  currentActionView,
  setCurrentActionView,
}) => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();
  const { currentBounty, setCurrentBounty } = useBounty();
  const { mutateAsync: updateBounty } = api.bountyUsers.update.useMutation();
  const { programId: buddylinkProgramId } = useReferral();

  const [currentApplicantsView, setCurrentApplicantsView] =
    useState<EApplicantsView>(EApplicantsView.All);
  const [selectedSubmitter, setSelectedSubmitter] =
    useState<BountyUserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log(currentBounty);

  const createdAtDate = new Date(
    Number(currentBounty?.createdAt)
  ).toLocaleDateString();

  const handleReject = async () => {
    if (!currentBounty || !selectedSubmitter) return;
    setIsLoading(true);
    const toastId = toast.loading("Submitting rejection...");

    const newRelations = [BOUNTY_USER_RELATIONSHIP.DeniedRequester];
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
      toast.error("Error submitting rejection", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!currentBounty || !selectedSubmitter) return;
    setIsLoading(true);
    const toastId = toast.loading("Submitting approval to shortlist...");

    const signature = await approveRequestFFA(
      new PublicKey(currentBounty?.currentSubmitter.publicKey),
      currentBounty?.escrow,
      currentWallet,
      buddylinkProgramId,
      program,
      provider
    );

    const newRelations = [BOUNTY_USER_RELATIONSHIP.ShortlistedSubmitter];
    try {
      const updatedBounty = await updateBounty({
        bountyId: currentBounty?.id,
        currentUserId: currentUser.id,
        userId: selectedSubmitter.userid,
        relations: newRelations,
        publicKey: selectedSubmitter.publicKey,
        escrowId: currentBounty?.escrowid,
        signature: signature,
        label: "approve-submitter",
      });

      setCurrentBounty(updatedBounty);
      setSelectedSubmitter(null);
      toast.success("Approval submitted", { id: toastId });
    } catch (error) {
      toast.error("Error submitting approval", { id: toastId });
    } finally {
      setIsLoading(false);
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
          <div className="w-full flex items-center justify-end gap-4">
            <motion.button
              {...smallClickAnimation}
              className="bg-white border border-neutral200 h-9 w-fit px-4 py-2
              title-text rounded-md text-error disabled:cursor-not-allowed disabled:opacity-80"
              onClick={handleReject}
              disabled={isLoading}
            >
              Reject this quote
            </motion.button>
            <motion.button
              {...smallClickAnimation}
              className="bg-primary200 border border-neutral200 h-9 w-fit px-4 py-2
              title-text rounded-md text-white disabled:cursor-not-allowed disabled:opacity-80"
              onClick={handleApprove}
              disabled={isLoading}
            >
              Approve this quote
            </motion.button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col">
      <ActionsCardBanner
        title="Applications Review"
        subtitle={`Started on ${createdAtDate}`}
      >
        {/* TODO: add fund CTA */}
      </ActionsCardBanner>
      <div className="flex flex-col gap-5 px-6 py-4">
        <div className="flex flex-col gap-1">
          <p className="title-text">{`${
            currentBounty.requestedSubmitters.length +
            currentBounty.deniedRequesters.length
          } profiles applied`}</p>
          <p className="text-neutral500 text">
            Shortlist up to 5 profiles to move on.
          </p>
        </div>
        <p className="title-text">Pending Applicants</p>
        {currentBounty.requestedSubmitters.length > 0 ? (
          currentBounty.requestedSubmitters.map((submitter, index) => {
            return (
              <div
                className={`w-full pb-5 ${
                  index !== currentBounty.requestedSubmitters.length - 1
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
        {currentBounty.deniedRequesters.length > 0 ? (
          <>
            <p className="title-text">Denied Applicants</p>
            {currentBounty.deniedRequesters.map((submitter, index) => {
              return (
                <div
                  className={`w-full pb-5 opacity-60 ${
                    index !== currentBounty.requestedSubmitters.length - 1
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
      </div>
    </div>
  );
};

export default ApplicantsView;
