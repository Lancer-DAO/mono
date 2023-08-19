import { FC } from "react";
import Image from "next/image";
import { CopyLinkField, TweetShareButton } from "@/components";
import { useBounty } from "@/src/providers/bountyProvider";
import { IS_CUSTODIAL } from "@/src/constants";

export const SuccessForm: FC = () => {
  const { currentBounty } = useBounty();
  const SITE_URL = `https://${
    IS_CUSTODIAL ? "app" : "pro"
  }.lancer.so/bounties/`;
  return (
    <div className="w-full flex flex-col gap-10">
      <h1>Congrats! Your Quest is live.</h1>
      <div className="flex justify-between">
        <div className="w-[500px] h-[350px] flex flex-col gap-5">
          <p>
            Sunt sunt ullamco anim aute cillum ex officia nostrud consequat sit.
            Sit adipisicing fugiat quis adipisicing nulla laboris consequat.
            Consectetur sit sit ex dolor est minim labore nulla veniam
            cupidatat. Est ullamco sit laborum occaecat sit reprehenderit aliqua
            deserunt ex veniam. Est laborum aute ullamco exercitation incididunt
            aute.
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
              <Image
                src="/assets/images/share/gmail.png"
                width={40}
                height={40}
                alt="X / twitter"
              />
              <Image
                src="/assets/images/share/linkedin.png"
                width={40}
                height={40}
                alt="X / twitter"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
