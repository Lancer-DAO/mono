import {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/router";

export interface IAppContextContext {
  isRouterReady: boolean;
  isMobile: boolean;
}

export const AppContextContext = createContext<IAppContextContext>({
  isRouterReady: false,
  isMobile: false,
});

export function useAppContext(): IAppContextContext {
  return useContext(AppContextContext);
}

interface IAppContextState {
  children?: React.ReactNode;
}
interface IAppContextProps {
  children?: ReactNode;
}

const AppContextProvider: FunctionComponent<IAppContextState> = ({
  children,
}: IAppContextProps) => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    const isMobileDevice =
      /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(userAgent);
    setIsMobile(isMobileDevice);
  }, []);

  const contextProvider = {
    isRouterReady: router.isReady,
    isMobile,
  };
  return (
    <AppContextContext.Provider value={contextProvider}>
      {children}
    </AppContextContext.Provider>
  );
};
export default AppContextProvider;
