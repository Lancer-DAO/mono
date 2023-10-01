import { IS_CUSTODIAL } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { api, updateList } from "@/src/utils";
import { BOUNTY_USER_RELATIONSHIP, QuestProgressState } from "@/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { FC, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import LancerApplyView from "./LancerApplyView";
import LancerSubmitQuoteView from "./LancerSubmitQuoteView";
import { QuestActionView } from "./QuestActions";

export enum QuestApplicationView {
  ProfileInfo = "profile-info",
  SubmitQuote = "submit-quote",
}

interface Props {
  setCurrentActionView: (view: QuestActionView) => void;
}

const LancerApplicationView: FC<Props> = ({ setCurrentActionView }) => {
  const { currentBounty, setCurrentBounty } = useBounty();
  const { currentUser, currentWallet } = useUserWallet();
  const { connected } = useWallet();

  const [currentApplicationView, setCurrentApplicationView] =
    useState<QuestApplicationView>(QuestApplicationView.SubmitQuote);
  const [hasApplied, setHasApplied] = useState(false);
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
  const { mutateAsync: updateBountyUsers } =
    api.bountyUsers.update.useMutation();
  const { mutateAsync: createQuote } = api.quote.createQuote.useMutation();

  const [quoteData, setQuoteData] = useState(() => {
    const savedData = localStorage.getItem(`quoteData-${currentBounty.id}`);
    return savedData
      ? JSON.parse(savedData)
      : {
          title: "",
          description: "",
          estimatedTime: 0,
          price: 0,
          state: QuestProgressState.NEW,
          checkpoints: [],
        };
  });

  const [applyData, setApplyData] = useState(() => {
    const savedData = localStorage.getItem(`applyData-${currentBounty.id}`);
    return savedData
      ? JSON.parse(savedData)
      : {
          portfolio: currentUser.website,
          linkedin: currentUser.linkedin,
          about: currentUser.bio,
          resume: currentUser.resume,
          details: "",
        };
  });

  const applicationIsValid =
    quoteData.checkpoints.length > 0 &&
    quoteData.checkpoints[0].title !== "" &&
    quoteData.checkpoints[0].description !== "" &&
    quoteData.checkpoints[0].price !== 0 &&
    quoteData.checkpoints[0].estimatedTime !== 0;

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
            Are you sure you want to send your application?
            <div className="mt-2 flex items-center gap-4 justify-center">
              <button
                onClick={handleYes}
                className="bg-primary200 text-white flex title-text
                items-center justify-center rounded-md px-3 py-1"
              >
                Yes
              </button>
              <button
                onClick={handleNo}
                className="bg-white border border-neutral300 flex text-error title-text
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

  const onClick = async () => {
    if (quoteData.checkpoints.length === 0) {
      toast.error("Please create at least one milestone.");
      return;
    }

    if (!connected && !IS_CUSTODIAL) {
      toast.error("Please connect your wallet.");
      return;
    }

    await confirmAction();
    // Request to submit. Does not interact on chain
    const toastId = toast.loading("Sending application...");
    try {
      const newRelations = updateList(
        currentBounty.currentUserRelationsList ?? [],
        [],
        [BOUNTY_USER_RELATIONSHIP.RequestedLancer]
      );
      const updatedBounty = await updateBountyUsers({
        currentUserId: currentUser.id,
        bountyId: currentBounty.id,
        userId: currentUser.id,
        relations: newRelations,
        publicKey: currentWallet.publicKey.toString(),
        escrowId: currentBounty.escrowid,
        label: "request-to-submit",
        signature: "n/a",
        applicationText: applyData.details,
      });
      await createQuote({
        bountyId: currentBounty.id,
        title: quoteData.title,
        description: quoteData.description,
        estimatedTime: quoteData.estimatedTime,
        price: quoteData.price,
        state: quoteData.state,
        checkpoints: quoteData.checkpoints,
      });

      setCurrentBounty(updatedBounty);
      setHasApplied(true);
      toast.success("Application sent", { id: toastId });

      // remove locally stored form data
      localStorage.removeItem(`quoteData-${currentBounty.id}`);
      localStorage.removeItem(`applyData-${currentBounty.id}`);
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
    }
  };

  // check if user has applied
  useEffect(() => {
    if (!currentBounty || !currentUser) return;
    const hasApplied = !!currentBounty.currentUserRelationsList;
    setHasApplied(hasApplied);
  }, [currentBounty, currentUser]);

  useEffect(() => {
    localStorage.setItem(
      `quoteData-${currentBounty.id}`,
      JSON.stringify(quoteData)
    );
  }, [quoteData, currentBounty.id]);

  useEffect(() => {
    localStorage.setItem(
      `applyData-${currentBounty.id}`,
      JSON.stringify(applyData)
    );
  }, [applyData, currentBounty.id]);

  return (
    <>
      {currentApplicationView === QuestApplicationView.ProfileInfo && (
        <LancerApplyView
          applyData={applyData}
          setApplyData={setApplyData}
          setCurrentApplicationView={setCurrentApplicationView}
          setCurrentActionView={setCurrentActionView}
          hasApplied={hasApplied}
          onClick={onClick}
          isAwaitingResponse={isAwaitingResponse}
          applicationIsValid={applicationIsValid}
        />
      )}
      {currentApplicationView === QuestApplicationView.SubmitQuote && (
        <LancerSubmitQuoteView
          quoteData={quoteData}
          setQuoteData={setQuoteData}
          setCurrentApplicationView={setCurrentApplicationView}
          setCurrentActionView={setCurrentActionView}
          hasApplied={hasApplied}
          onClick={onClick}
          isAwaitingResponse={isAwaitingResponse}
          applicationIsValid={applicationIsValid}
        />
      )}
    </>
  );
};

export default LancerApplicationView;
