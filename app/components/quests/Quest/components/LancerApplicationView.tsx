import { IS_CUSTODIAL } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import {
  QuestActionView,
  QuestApplicationView,
  useBounty,
} from "@/src/providers/bountyProvider";
import { api, updateList } from "@/src/utils";
import { BOUNTY_USER_RELATIONSHIP, QuestProgressState } from "@/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { FC, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import LancerApplyView from "./LancerApplyView";
import LancerSubmitQuoteView from "./LancerSubmitQuoteView";

interface Props {
  setCurrentActionView: (view: QuestActionView) => void;
  hasApplied: boolean;
}

const LancerApplicationView: FC<Props> = ({
  setCurrentActionView,
  hasApplied,
}) => {
  const {
    currentBounty,
    setCurrentBounty,
    currentApplicationView,
    setCurrentApplicationView,
  } = useBounty();
  const { currentUser, currentWallet } = useUserWallet();
  const { connected } = useWallet();

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

  const applicationIsValid = currentUser.hasBeenApproved;

  const confirmAction = (action?: string): Promise<void> => {
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
            {`Are you sure you want to ${
              action ? action : "submit your application"
            }?`}
            <div className="mt-2 flex items-center gap-4 justify-center">
              <button
                onClick={handleYes}
                className="bg-primary200 text-white flex title-text
                items-center justify-center rounded-md px-3 py-1"
              >
                Submit
              </button>
              <button
                onClick={handleNo}
                className="bg-white border border-neutral300 flex text-error title-text
                items-center justify-center rounded-md px-3 py-1"
              >
                Cancel
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

  const applyLite = async () => {
    if (!connected && !IS_CUSTODIAL) {
      const toastId = toast.error("Please connect your wallet.");
      setTimeout(() => {
        toast.dismiss(toastId);
      }, 2000);
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
      });

      setCurrentBounty(updatedBounty);
      toast.success("Application sent", { id: toastId });
      setCurrentActionView(QuestActionView.Chat);

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
    }
  };

  const submitQuote = async () => {
    await confirmAction("submit your quote");

    if (quoteData.checkpoints.length === 0) {
      const toastId = toast.error("Please create at least one milestone.");
      setTimeout(() => {
        toast.dismiss(toastId);
      }, 2000);
      return;
    }

    const toastId = toast.loading("Sending Quote...");

    try {
      await createQuote({
        bountyId: currentBounty.id,
        title: quoteData.title,
        description: quoteData.description,
        estimatedTime: quoteData.estimatedTime,
        price: quoteData.price,
        state: quoteData.state,
        checkpoints: quoteData.checkpoints,
      });

      toast.success("Quote sent!", { id: toastId });

      // remove locally stored form data
      localStorage.removeItem(`quoteData-${currentBounty.id}`);
      localStorage.removeItem(`applyData-${currentBounty.id}`);
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
    }
  };

  useEffect(() => {
    localStorage.setItem(
      `quoteData-${currentBounty.id}`,
      JSON.stringify(quoteData)
    );
  }, [quoteData, currentBounty.id]);

  return (
    <>
      {currentApplicationView === QuestApplicationView.ProfileInfo && (
        <LancerApplyView
          setCurrentActionView={setCurrentActionView}
          hasApplied={hasApplied}
          onClick={applyLite}
        />
      )}
      {currentApplicationView === QuestApplicationView.SubmitQuote && (
        <LancerSubmitQuoteView
          quoteData={quoteData}
          setQuoteData={setQuoteData}
          setCurrentApplicationView={setCurrentApplicationView}
          setCurrentActionView={setCurrentActionView}
          onClick={submitQuote}
          isAwaitingResponse={isAwaitingResponse}
        />
      )}
    </>
  );
};

export default LancerApplicationView;
