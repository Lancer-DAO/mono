import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { api, updateList } from "@/src/utils";
import {
  BOUNTY_USER_RELATIONSHIP,
  LancerApplyData,
  LancerQuoteData,
  QuestProgressState,
} from "@/types";
import { FC, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import LancerApplyView from "./LancerApplyView";
import LancerSubmitQuoteView from "./LancerSubmitQuoteView";

export enum QuestApplicationView {
  ProfileInfo = "profile-info",
  SubmitQuote = "submit-quote",
}

const LancerApplicationView: FC = () => {
  const { currentBounty, setCurrentBounty } = useBounty();
  const { currentUser, currentWallet } = useUserWallet();

  const [currentApplicationView, setCurrentApplicationView] =
    useState<QuestApplicationView>(QuestApplicationView.SubmitQuote);
  const [hasApplied, setHasApplied] = useState(false);
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
  const { mutateAsync: updateBountyUsers } =
    api.bountyUsers.update.useMutation();
  const { mutateAsync: createQuote } = api.quote.createQuote.useMutation();

  const [quoteData, setQuoteData] = useState(() => {
    const storedForms = JSON.parse(localStorage.getItem("formsData")) || {};
    return (
      storedForms[currentBounty.id]?.quoteData || {
        title: "",
        description: "",
        estimatedTime: 0,
        price: 0,
        state: QuestProgressState.NEW,
        checkpoints: [],
      }
    );
  });

  const [applyData, setApplyData] = useState(() => {
    const storedForms = JSON.parse(localStorage.getItem("formsData")) || {};
    return (
      storedForms[currentBounty.id]?.applyData || {
        portfolio: currentUser.website,
        linkedin: currentUser.linkedin,
        about: currentUser.bio,
        resume: currentUser.resume,
        details: "",
      }
    );
  });

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
      let storedForms = JSON.parse(localStorage.getItem("formsData")) || {};
      delete storedForms[currentBounty.id];
      localStorage.setItem("formsData", JSON.stringify(storedForms));
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
    const hasApplied = currentBounty.currentUserRelationsList?.some(
      (relation) => relation === BOUNTY_USER_RELATIONSHIP.RequestedLancer
    );
    setHasApplied(hasApplied);
  }, [currentBounty, currentUser]);

  // useEffect to update local storage whenever application data changes
  useEffect(() => {
    let storedFormsData = JSON.parse(localStorage.getItem("formsData")) ?? {};

    storedFormsData[currentBounty.id] = {
      quoteData: quoteData,
      applyData: applyData,
    };

    localStorage.setItem("formsData", JSON.stringify(storedFormsData));
  }, [quoteData, currentBounty.id, applyData]);

  return (
    <>
      {currentApplicationView === QuestApplicationView.ProfileInfo && (
        <LancerApplyView
          applyData={applyData}
          setApplyData={setApplyData}
          setCurrentApplicationView={setCurrentApplicationView}
          hasApplied={hasApplied}
          onClick={onClick}
          isAwaitingResponse={isAwaitingResponse}
        />
      )}
      {currentApplicationView === QuestApplicationView.SubmitQuote && (
        <LancerSubmitQuoteView
          quoteData={quoteData}
          setQuoteData={setQuoteData}
          setCurrentApplicationView={setCurrentApplicationView}
          hasApplied={hasApplied}
          onClick={onClick}
          isAwaitingResponse={isAwaitingResponse}
        />
      )}
    </>
  );
};

export default LancerApplicationView;
