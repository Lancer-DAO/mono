import {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useState,
} from "react";
export interface IDebugModeContext {
  isDebugMode: boolean;
  setIsDebugMode: (debug: boolean) => void;
}

export const DebugModeContext = createContext<IDebugModeContext>({
  isDebugMode: false,
  setIsDebugMode: () => null,
});

export function useDebugMode(): IDebugModeContext {
  return useContext(DebugModeContext);
}

interface IDebugModeState {
  children?: React.ReactNode;
}
interface IDebugModeProps {
  children?: ReactNode;
}

const DebugModeProvider: FunctionComponent<IDebugModeState> = ({
  children,
}: IDebugModeProps) => {
  const [isDebugMode, setIsDebugMode] = useState<boolean>(false);

  const contextProvider = {
    isDebugMode,
    setIsDebugMode,
  };
  return (
    <DebugModeContext.Provider value={contextProvider}>
      {children}
    </DebugModeContext.Provider>
  );
};
export default DebugModeProvider;
