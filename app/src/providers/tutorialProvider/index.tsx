import {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { Tutorial } from "@/src/types/tutorials";

export interface ITutorialContext {
  currentTutorialState: Tutorial;
  setCurrentTutorialState: (tutorial: Tutorial) => void;
}

export const TutorialContext = createContext<ITutorialContext>({
  currentTutorialState: null,
  setCurrentTutorialState: () => null,
});

export function useTutorial(): ITutorialContext {
  return useContext(TutorialContext);
}

interface ITutorialState {
  children?: React.ReactNode;
}
interface ITutorialProps {
  children?: ReactNode;
}

const TutorialProvider: FunctionComponent<ITutorialState> = ({
  children,
}: ITutorialProps) => {
  const [currentTutorialState, setCurrentTutorialState] = useState<Tutorial>();

  const contextProvider = {
    currentTutorialState,
    setCurrentTutorialState,
  };
  return (
    <TutorialContext.Provider value={contextProvider}>
      {children}
    </TutorialContext.Provider>
  );
};
export default TutorialProvider;
