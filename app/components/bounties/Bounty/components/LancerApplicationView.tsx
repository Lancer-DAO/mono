import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { Checkpoint, LancerApplyData, LancerQuoteData, QuestProgressState } from "@/types";
import { Quote } from "@prisma/client";
import { Dispatch, FC, SetStateAction, useState } from "react";
import LancerApplyView from "./LancerApplyView";
import LancerSubmitQuoteView from "./LancerSubmitQuoteView";
import { QuestActionView } from "./QuestActions";
interface Props {
  currentActionView: QuestActionView;
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>;
}

const LancerApplicationView: FC<Props> = ({ currentActionView, setCurrentActionView }) => {
  const { currentUser } = useUserWallet();

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

  return (
    <>
      {currentActionView === QuestActionView.Apply && (
        <LancerApplyView
          applyData={applyData}
          setApplyData={setApplyData}  
          quoteData={quoteData}
          setCurrentActionView={setCurrentActionView}
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