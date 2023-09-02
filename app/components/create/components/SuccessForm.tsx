import { FC, useState } from "react";
import { CopyLinkField, TweetShareButton } from "@/components";
import { useBounty } from "@/src/providers/bountyProvider";
import { IS_CUSTODIAL } from "@/src/constants";
import FundCTA from "@/components/atoms/FundCTA";

export const SuccessForm: FC = () => {
  const { currentBounty } = useBounty();
  const SITE_URL = `https://${IS_CUSTODIAL ? "app" : "pro"}.lancer.so/quests/`;

  const [isFunded, setIsFunded] = useState(false);
  return (
    <div className="w-full flex flex-col gap-10 px-10">
      <h1 className="whitespace-nowrap">Congrats! Your Quest is live.</h1>
      <div className="flex justify-between">
        <div className="w-[500px] flex flex-col gap-5">
          {!isFunded && <FundCTA setIsFunded={setIsFunded} />}
          <p>
            “A person should set his goals as early as he can and devote all his
            energy and talent to getting there. With enough effort, he may
            achieve it. Or he may find something that is even more rewarding.
            But in the end, no matter that the outcome, he will know he has been
            alive.”
            <br />– Walt Disney
          </p>
          <div className="flex flex-col gap-3">
            <h1 className="text-lg">Share to freelancers:</h1>
            <CopyLinkField url={`${SITE_URL}${currentBounty?.id.toString()}`} />
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-lg">Share to the world:</h1>
            <div className="flex items-center gap-3">
              <TweetShareButton
                url={`${SITE_URL}${currentBounty?.id.toString()}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
