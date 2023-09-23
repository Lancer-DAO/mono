import { useUserWallet } from "@/src/providers";
import { LancerApplyData, QuestProgressState } from "@/types";
import { Dispatch, FC, SetStateAction, useState } from "react";
import LancerApplyView from "./LancerApplyView";
import LancerSubmitQuoteView from "./LancerSubmitQuoteView";
import { QuestActionView } from "./QuestActions";

export interface Checkpoint {
  title: string;
  price: number;
  description: string;
  estimatedTime: number;
}

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

  const [quoteData, setQuoteData] = useState<Checkpoint[]>([
    {
      title: "Sketches and early ideas",
      price: 400,
      description: "",
      estimatedTime: 4,
    },
    {
      title: "Wireframes and iterations",
      price: 400,
      description: "",
      estimatedTime: 4,
    }
  ]);

  return (
    <>
      {currentActionView === QuestActionView.Apply && (
        <LancerApplyView
          applyData={applyData}
          setApplyData={setApplyData}  
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