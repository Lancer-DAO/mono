import { Mint } from "@/types/";
import {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useState,
} from "react";
export interface IMintContext {
  allMints: Mint[];
  setAllMints: (mints: Mint[]) => void;
}

export const MintContext = createContext<IMintContext>({
  allMints: [] as Mint[],
  setAllMints: () => null,
});

export function useMint(): IMintContext {
  return useContext(MintContext);
}

interface IMintState {
  children?: React.ReactNode;
}
interface IMintProps {
  children?: ReactNode;
}

const MintProvider: FunctionComponent<IMintState> = ({
  children,
}: IMintProps) => {
  const [allMints, setAllMints] = useState<Mint[] | null>(null);

  const contextProvider = {
    allMints,
    setAllMints,
  };
  return (
    <MintContext.Provider value={contextProvider}>
      {children}
    </MintContext.Provider>
  );
};
export default MintProvider;
