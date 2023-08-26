import { LoadingBar } from "@/components";
import { IAsyncResult, User } from "@/types";
import { FC } from "react";

interface Props {
  account: IAsyncResult<User>;
}

export const WelcomeView: FC<Props> = ({ account }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {account.isLoading && <LoadingBar title={account.loadingPrompt} />}
      {account.error && (
        <div className="color-red">{account.error.message}</div>
      )}
      {account.result && (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="text-3xl font-bold">
            Welcome {account.result.name}!
          </div>
          <div className="text-lg font-bold mt-4">Your Profile is Ready</div>
          <div className="text-lg font-bold mt-4">
            You can now start earning rewards
          </div>
        </div>
      )}
    </div>
  );
};