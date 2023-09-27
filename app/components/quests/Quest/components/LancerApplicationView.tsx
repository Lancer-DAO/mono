import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { BOUNTY_USER_RELATIONSHIP, LancerApplyData, LancerQuoteData, QuestProgressState } from "@/types";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import LancerApplyView from "./LancerApplyView";
import LancerSubmitQuoteView from "./LancerSubmitQuoteView";
import { QuestActionView } from "./QuestActions";
interface Props {
  currentActionView: QuestActionView;
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>;
}

const LancerApplicationView: FC<Props> = ({ currentActionView, setCurrentActionView }) => {
  const { currentBounty } = useBounty();
  const { currentUser } = useUserWallet();

  const [hasApplied, setHasApplied] = useState(false);

  const [applyData, setApplyData] = useState<LancerApplyData>({
    portfolio: currentUser.website,
    linkedin: currentUser.linkedin,
    about: currentUser.bio,
    resume: currentUser.resume,
    details: "",
  });

  const [quoteData, setQuoteData] = useState<LancerQuoteData>({
    title: "",
    description: "",
    estimatedTime: 0,
    price: 0,
    state: QuestProgressState.NEW,
    checkpoints: [],
  });

  // check if user has applied
  useEffect(() => {
    if (!currentBounty || !currentUser) return;
    const hasApplied = currentBounty.currentUserRelationsList?.some(
      (relation) => relation === BOUNTY_USER_RELATIONSHIP.RequestedLancer
    );
    setHasApplied(hasApplied);
    if(hasApplied) {
      setCurrentActionView(QuestActionView.Apply);
    }   
  }, [currentBounty, currentUser, setCurrentActionView]);

  return (
    <>
      {currentActionView === QuestActionView.Apply && (
        <LancerApplyView
          applyData={applyData}
          setApplyData={setApplyData}  
          quoteData={quoteData}
          setCurrentActionView={setCurrentActionView}
          hasApplied={hasApplied}
          setHasApplied={setHasApplied}
        />
      )}
      {currentActionView === QuestActionView.SubmitQuote && (
        <LancerSubmitQuoteView 
          quoteData={quoteData}
          setQuoteData={setQuoteData}
          setCurrentActionView={setCurrentActionView}
        />
      )}  
    </>
  )
}

export default LancerApplicationView;