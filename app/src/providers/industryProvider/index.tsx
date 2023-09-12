import { Industry } from "@/types/";
import {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useState,
} from "react";
export interface IIndustryContext {
  allIndustries: Industry[];
  setAllIndustries: (mints: Industry[]) => void;
}

export const IndustryContext = createContext<IIndustryContext>({
  allIndustries: [],
  setAllIndustries: () => null,
});

export function useIndustry(): IIndustryContext {
  return useContext(IndustryContext);
}

interface IIndustryState {
  children?: React.ReactNode;
}
interface IIndustryProps {
  children?: ReactNode;
}

const IndustryProvider: FunctionComponent<IIndustryState> = ({
  children,
}: IIndustryProps) => {
  const [allIndustries, setAllIndustries] = useState<Industry[] | null>(null);

  const contextProvider = {
    allIndustries,
    setAllIndustries,
  };
  return (
    <IndustryContext.Provider value={contextProvider}>
      {children}
    </IndustryContext.Provider>
  );
};
export default IndustryProvider;
