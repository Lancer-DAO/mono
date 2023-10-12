import { ChatButton, FundQuestModal } from "@/components";
import RedFire from "@/components/@icons/RedFire";
import { addSubmitterFFA } from "@/escrow/adapters";
import { BountyUserType } from "@/prisma/queries/bounty";
import { MAX_SHORTLIST, smallClickAnimation } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { useReferral } from "@/src/providers/referralProvider";
import { api, updateList } from "@/src/utils";
import { BOUNTY_USER_RELATIONSHIP, BountyState } from "@/types";
import { PublicKey } from "@solana/web3.js";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { Dispatch, FC, SetStateAction, useState } from "react";
import toast from "react-hot-toast";
import { EApplicantsView } from "./ApplicantsView";
import CheckpointView from "./CheckpointView";
import DepositCTAModal from "./DepositCTAModal";
import { QuestActionView } from "./QuestActions";

interface Props {
  selectedSubmitter: BountyUserType;
  setSelectedSubmitter: Dispatch<SetStateAction<BountyUserType | null>>;
  setCurrentApplicantsView: Dispatch<SetStateAction<EApplicantsView>>;
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

const IndividualApplicantView: FC<Props> = ({
  selectedSubmitter,
  setSelectedSubmitter,
  setCurrentActionView,
  setCurrentApplicantsView,
  isLoading,
  setIsLoading,
}) => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();
  const { currentBounty, setCurrentBounty } = useBounty();
  const { mutateAsync: updateBounty } = api.bountyUsers.update.useMutation();
  const { getRemainingAccounts, getSubmitterReferrer } = useReferral();
  const { data: quote } = api.quote.getQuoteByBountyAndUser.useQuery(
    {
      bountyId: currentBounty.id,
      userId: selectedSubmitter.userid,
    },
    { enabled: !!currentBounty }
  );
  const { data: checkpoints } = api.checkpoint.getCheckpointsByQuote.useQuery(
    { id: quote?.id },
    { enabled: !!quote }
  );
  // const { data: highestQuote } = api.quote.getHighestQuoteByBounty.useQuery(
  //   {
  //     bountyId: currentBounty.id,
  //   },
  //   {
  //     enabled: !!currentBounty,
  //   }
  // );

  const [showModal, setShowModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);

  const handleApproveForQuest = async (addDelay?: boolean) => {
    if (!currentBounty || !selectedSubmitter) return;
    const toastId = toast.loading("Approving Your Lancer...");
    if (addDelay) {
      await new Promise((r) => setTimeout(r, Number(5000)));
    }
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
        toast.error("Error approving submitter", {
          id: toastId,
        });
        setTimeout(() => {
          toast.dismiss(toastId);
        }, 2000);
      }
    }
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
      } else {
        toast.error("Error submitting rejection", {
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

  // const handleManageShortlist = async (action: "add" | "remove") => {
  //   if (!currentBounty || !selectedSubmitter) return;

  //   setIsLoading(true);
  //   const toastId = toast.loading(
  //     action === "add" ? "Adding to shortlist..." : "Removing from shortlist..."
  //   );
  //   try {
  //     const newRelations =
  //       action === "add"
  //         ? [BOUNTY_USER_RELATIONSHIP.ShortlistedLancer]
  //         : [BOUNTY_USER_RELATIONSHIP.RequestedLancer];
  //     const updatedBounty = await updateBounty({
  //       bountyId: currentBounty?.id,
  //       currentUserId: currentUser.id,
  //       userId: selectedSubmitter.userid,
  //       relations: newRelations,
  //       publicKey: selectedSubmitter.publicKey,
  //       escrowId: currentBounty?.escrowid,
  //       signature: "n/a",
  //       state: BountyState.REVIEWING_SHORTLIST,
  //       label: action === "add" ? "add-to-shortlist" : "remove-from-shortlist",
  //     });

  //     setCurrentBounty(updatedBounty);
  //     setSelectedSubmitter(null);
  //     toast.success(
  //       action === "add"
  //         ? "Successfully added to shortlist"
  //         : "Successfully removed from shortlist",
  //       { id: toastId }
  //     );
  //     setTimeout(() => {
  //       toast.dismiss(toastId);
  //     }, 2000);
  //   } catch (error) {
  //     if (
  //       (error.message as string).includes(
  //         "Wallet is registered to another user"
  //       )
  //     ) {
  //       toast.error("Wallet is registered to another user", {
  //         id: toastId,
  //       });
  //       setTimeout(() => {
  //         toast.dismiss(toastId);
  //       }, 2000);
  //     } else {
  //       toast.error(
  //         action === "add"
  //           ? "Error adding to shortlist"
  //           : "Error removing from shortlist",
  //         { id: toastId }
  //       );
  //       setTimeout(() => {
  //         toast.dismiss(toastId);
  //       }, 2000);
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="w-full flex flex-col">
          {/* banner */}
          <div
            className="w-full px-6 py-4 bg-white flex items-center 
            justify-between border-b border-neutral200"
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
        <div className="h-full relative flex flex-col gap-8">
          <div className="flex flex-col px-8 py-2">
            <div className="flex py-4 justify-between border-b border-neutral200">
              <div className="flex items-center gap-2">
                <RedFire />
                <div className="title-text text-neutral600">Quote Price</div>
                <div className="w-[1px] h-5 bg-neutral200" />
                <div className="text-mini text-neutral400">{`${
                  quote?.estimatedTime ?? 0
                }h`}</div>
              </div>
              <div className="flex items-center title-text text-primary200">{`$${
                quote?.price ?? 0
              }`}</div>
            </div>
            {checkpoints?.map((checkpoint, index) => (
              <CheckpointView checkpoint={checkpoint} key={index} />
            ))}
          </div>
          <div className="flex flex-col gap-2.5 px-8 py-2">
            <p className="text-neutral600 title-text">{`About ${selectedSubmitter.user.name}`}</p>
            <p className="text">{selectedSubmitter.user.bio}</p>
          </div>
          {/* action buttons */}
          {selectedSubmitter.relations.includes(
            BOUNTY_USER_RELATIONSHIP.RequestedLancer
          ) ? (
            <div className="mt-auto self-stretch">
              <div className="h-[1px] w-full bg-neutral200" />
              <div className="w-full flex items-center justify-end gap-4 px-8 py-4">
                <ChatButton
                  setCurrentActionView={setCurrentActionView}
                  disabled={isLoading}
                />
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
                  className="bg-primary200 h-9 w-fit px-4 py-2
                title-text rounded-md text-white disabled:cursor-not-allowed disabled:opacity-80"
                  onClick={() => {
                    if (
                      Number(quote.price) -
                        Number(currentBounty.escrow.amount) >
                      0
                    ) {
                      setShowModal(true);
                    } else {
                      // run approval function anyways
                      handleApproveForQuest();
                    }
                  }}
                  disabled={isLoading}
                >
                  Select for the Quest
                </motion.button>
              </div>
            </div>
          ) : null}
          {showModal && (
            <DepositCTAModal
              prompt="Now that you have selected a Lancer for your Quest, you will need to deposit the remaining amount of the quote into escrow. This will be released to the submitter once you have approved their work. These funds are fully refundable if the Quest is cancelled or the submitter is unable to complete the Quest."
              setShowModal={setShowModal}
              setShowFundModal={setShowFundModal}
              amount={Number(quote.price)}
            />
          )}
        </div>
      </div>
      {showFundModal && (
        <FundQuestModal
          setShowModal={setShowFundModal}
          setShowFundModal={setShowFundModal}
          amount={Number(quote.price)}
          handleApproveForQuest={handleApproveForQuest}
          approving={true}
        />
      )}
    </>
  );
};

export default IndividualApplicantView;
