import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, CoinflowOfframp, CopyLinkField } from "@/components";
import { IS_CUSTODIAL } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { useReferral } from "@/src/providers/referralProvider";
import { api } from "@/src/utils";
import { Treasury } from "@ladderlabs/buddy-sdk";
import * as Prisma from "@prisma/client";

const SITE_URL = `https://${IS_CUSTODIAL ? "app" : "pro"}.lancer.so/account?r=`;

export const ReferCard = () => {
  const [showCoinflow, setShowCoinflow] = useState(false);
  const [invites, setInvites] = useState(1);
  const { referralId, initialized, createReferralMember, claimables, claim } =
    useReferral();

  const { currentWallet } = useUserWallet();
  const { data: allMints } = api.mints.getMints.useQuery();

  const handleCreateLink = useCallback(async () => {
    try {
      await createReferralMember();
    } catch (e) {
      console.log("error creating referral member: ", e);
    }
  }, [initialized]);

  const handleClaim = async (amount: number, treasury: Treasury) => {
    if (amount) await claim(treasury);
  };

  const claimButtons = useMemo(() => {
    return claimables
      .filter((claimable) => claimable.amount !== 0)
      .map((claimable) => {
        const claimMintKey = claimable.treasury.account.mint.toString();
        const claimMint = allMints.filter(
          (mint) => mint.publicKey === claimMintKey
        )[0];
        return (
          <Button
            className="border bg-primaryBtn border-primaryBtnBorder text-lg rounded-md px-6 py-3 uppercase font-bold text-textGreen mt-4"
            onClick={() => handleClaim(claimable.amount, claimable.treasury)}
          >
            Claim {claimable.amount} {claimMint?.ticker}
          </Button>
        );
      });
  }, [claimables, allMints, currentWallet]);

  const renderCircles = (invitesLeft) => {
    const circles = [];
    for (let i = 0; i < 3; i++) {
      const circleColor = i < invitesLeft ? "green" : "red";
      circles.push(
        <div
          key={i}
          className={`mr-1 w-3 h-3 bg-transparent rounded-full border border-${circleColor}-400 border-solid bg-${circleColor}-300 self-center`}
        ></div>
      );
    }
    return circles;
  };

  return (
    <div className="flex gap-5">
      <div className="w-full md:w-[460px] rounded-xl bg-bgLancerSecondary/[8%] overflow-hidden p-6">
        <div className="flex justify-between">
          <p className="font-bold text-2xl text-textGreen mb-6">Refer & Earn</p>
          {/* TODO: remove forced false when we add referral limit */}
          {referralId && initialized && false ? (
            <div className="flex self-start">
              <p className="text-green-700 mr-2">
                {invites} {invites === 1 ? "invite" : "invites"} left
              </p>
              {renderCircles(invites)}
            </div>
          ) : (
            <></>
          )}
        </div>
        {referralId && initialized ? (
          <>
            <div className="text-textGreen">
              <p className="uppercase pb-1 px-1 font-medium">
                Share to earn 1% of each referral
              </p>
              <CopyLinkField url={`${SITE_URL}${referralId}`} />
            </div>
            <div className="">
              {claimables &&
              claimables.filter((claimable) => claimable.amount > 0).length >
                0 ? (
                <>
                  {claimButtons}
                  <Button
                    className="border bg-primaryBtn border-primaryBtnBorder text-lg rounded-md px-6 py-3 uppercase font-bold text-textGreen mt-4"
                    onClick={() => {
                      setShowCoinflow(!showCoinflow);
                    }}
                  >
                    Cash Out
                  </Button>
                  {showCoinflow && <CoinflowOfframp />}
                </>
              ) : (
                <>
                  <Button
                    className="border bg-primaryBtn border-primaryBtnBorder text-lg rounded-md px-6 py-3 uppercase font-bold text-textGreen mt-4"
                    onClick={() => {
                      setShowCoinflow(!showCoinflow);
                    }}
                  >
                    Cash Out
                  </Button>
                  {showCoinflow && <CoinflowOfframp />}
                </>
              )}
            </div>
          </>
        ) : (
          <div>
            <p className="uppercase pb-1 px-1 text-textGreen font-medium">
              Share to earn 1% of each referral
            </p>
            <div className="flex items-center px-4 py-4 bg-white border border-primaryBtnBorder uppercase rounded-md gap-2">
              <Button
                className="text-textGreen text-sm"
                onClick={handleCreateLink}
              >
                Generate Referral Link
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="w-full md:w-[345px] rounded-xl bg-bgLancerSecondary/[8%] overflow-hidden p-6 text-textGreen font-medium">
        <p className="font-bold text-2xl mb-6">How It Works</p>
        <div className="flex items-center">
          <p className="ml-3 mr-6 my-5">1</p>
          <div>Share your link with another talented freelancer</div>
        </div>
        <div className="flex items-center">
          <p className="ml-3 mr-6 my-5">2</p>
          <div>They sign up and complete work</div>
        </div>
        <div className="flex items-center">
          <p className="ml-3 mr-6 my-5">3</p>
          <div>You earn 10% of the marketplace fee</div>
        </div>
      </div>
    </div>
  );
};
