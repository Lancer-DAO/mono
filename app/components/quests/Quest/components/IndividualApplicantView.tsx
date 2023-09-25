import { Dispatch, FC, SetStateAction } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { EApplicantsView } from "./ApplicantsView";
import { MAX_SHORTLIST, smallClickAnimation } from "@/src/constants";
import { BOUNTY_USER_RELATIONSHIP, BountyState } from "@/types";
import { ChatButton } from "@/components";
import { addSubmitterFFA } from "@/escrow/adapters";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { useReferral } from "@/src/providers/referralProvider";
import { api, updateList } from "@/src/utils";
import { PublicKey } from "@solana/web3.js";
import toast from "react-hot-toast";
import { BountyUserType } from "@/prisma/queries/bounty";
import { QuestActionView } from "./QuestActions";

interface Props {
  selectedSubmitter: BountyUserType;
  setSelectedSubmitter: Dispatch<SetStateAction<BountyUserType | null>>;
  setCurrentApplicantsView: Dispatch<SetStateAction<EApplicantsView>>;
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  isAwaitingResponse: boolean;
  setIsAwaitingResponse: Dispatch<SetStateAction<boolean>>;
}

const IndividualApplicantView: FC<Props> = ({
  selectedSubmitter,
  setSelectedSubmitter,
  setCurrentActionView,
  setCurrentApplicantsView,
  isLoading,
  setIsLoading,
  isAwaitingResponse,
  setIsAwaitingResponse,
}) => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();
  const { currentBounty, setCurrentBounty } = useBounty();
  const { mutateAsync: updateBounty } = api.bountyUsers.update.useMutation();
  const { getRemainingAccounts, getSubmitterReferrer } = useReferral();

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

  const handleApproveForQuest = async () => {
    if (!currentBounty || !selectedSubmitter) return;

    setIsLoading(true);
    await confirmAction("approve this Lancer");
    const toastId = toast.loading("Approving Your Lancer...");
    try {
      const submitterWallet = new PublicKey(selectedSubmitter.publicKey);
      const remainingAccounts = await getRemainingAccounts(
        submitterWallet,
        new PublicKey(currentBounty?.escrow.mint.publicKey)
      );
      const refferer = await getSubmitterReferrer(
        submitterWallet,
        new PublicKey(currentBounty?.escrow.mint.publicKey)
      );
      console.log("refferer", refferer.toBase58());
      const signature = await addSubmitterFFA(
        submitterWallet,
        currentBounty?.escrow,
        currentWallet,
        refferer,
        remainingAccounts,
        program,
        provider
      );
      const newRelations = updateList(
        selectedSubmitter.userid === currentUser.id
          ? currentBounty?.currentUserRelationsList
          : [],
        [BOUNTY_USER_RELATIONSHIP.RequestedLancer],
        [BOUNTY_USER_RELATIONSHIP.ApprovedSubmitter]
      );
      const updatedBounty = await updateBounty({
        bountyId: currentBounty?.id,
        userId: selectedSubmitter.userid,
        currentUserId: currentUser.id,
        relations: newRelations,
        state: BountyState.IN_PROGRESS,
        publicKey: selectedSubmitter.publicKey,
        escrowId: currentBounty?.escrowid,
        signature,
        label: "add-approved-submitter",
      });

      setCurrentBounty(updatedBounty);
      toast.success("Successfully approved submitter", { id: toastId });
    } catch (error) {
      if (
        (error.message as string).includes(
          "Wallet is registered to another user"
        )
      ) {
        toast.error("Wallet is registered to another user", { id: toastId });
      } else {
        toast.error("Error approving submitter", { id: toastId });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
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
              <h1 className="text-neutral600">{selectedSubmitter.user.name}</h1>
              {/* <p className="text text-neutral400">
                  {selectedSubmitter.user.industries[0]}
                </p> */}
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
        {selectedSubmitter.relations.includes(
          BOUNTY_USER_RELATIONSHIP.RequestedLancer
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
        <div className="w-full flex items-center justify-end gap-4">
          {(selectedSubmitter.relations.includes(
            BOUNTY_USER_RELATIONSHIP.ShortlistedLancer
          ) ||
            selectedSubmitter.relations.includes(
              BOUNTY_USER_RELATIONSHIP.ApprovedSubmitter
            )) &&
          Number(currentBounty.escrow.amount) > 0 ? (
            <ChatButton
              setCurrentActionView={setCurrentActionView}
              disabled={isLoading || isAwaitingResponse}
            />
          ) : null}
          {selectedSubmitter.relations.includes(
            BOUNTY_USER_RELATIONSHIP.ShortlistedLancer
          ) && Number(currentBounty.escrow.amount) > 0 ? (
            <>
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
                onClick={() => handleApproveForQuest()}
                disabled={isLoading || isAwaitingResponse}
              >
                Select for the Quest
              </motion.button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default IndividualApplicantView;
