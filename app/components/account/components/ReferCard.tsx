import { Button, CoinflowOfframp } from "@/components";
import Logo from "@/components/@icons/Logo";
import { IS_CUSTODIAL } from "@/src/constants";
import { useReferral } from "@/src/providers/referralProvider";
import { useCallback, useState } from "react";
import { Copy } from "react-feather";

const SITE_URL = `https://${IS_CUSTODIAL ? "app" : "pro"}.lancer.so/account?r=`;

export const ReferCard = () => {
  const [showCoinflow, setShowCoinflow] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [invites, setInvites] = useState(1);
  const { referralId, initialized, createReferralMember, claimables, claim } = useReferral();

  const handleCreateLink = useCallback(async () => {
    await createReferralMember();

    // TODO: success logic
  }, [initialized]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }

  const handleCopyClick = (text: string) => {
    copyToClipboard(text);
    setTimeout(() => setIsCopied(false), 2000); // Reset the isCopied state after 2 seconds
  }

  const renderCircles = (invitesLeft) => {
    const circles = [];
    for (let i = 0; i < 3; i++) {
      const circleColor = i < invitesLeft ? 'green' : 'red';
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
    <div className="flex gap-4">
      <div className="w-full md:w-[460px] rounded-xl bg-bgLancerSecondary/[8%] overflow-hidden p-6">
        <div className="flex justify-between">
          <p className="font-bold text-2xl text-textGreen mb-6">Refer & Earn</p>
          {
          // referralId && initialized
          true ? (
            <div className="flex self-start">
              <p className="text-green-700 mr-2">{invites} {invites === 1 ? 'invite' : 'invites'} left</p>
            {renderCircles(invites)}
            </div>
          ) : <></>}
        </div>
        {
        // referralId && initialized 
        true
        ? ( 
          <div>
            <div>
              <p className="uppercase pb-1 px-1 text-green-700 font-medium">Share to earn 1% of each referral</p>
              <div className="flex justify-between items-center px-4 py-4 bg-white border border-primaryBtnBorder uppercase rounded-md gap-2">
                <Logo height="24" width="24" />
                <p className="text-green-500 text-sm">{SITE_URL}{referralId}</p>
                <div className="relative">
                  <Copy className="cursor-pointer" onClick={() => handleCopyClick(`${SITE_URL}${referralId}`)} />
                  <div className="absolute text-sm right-0">{isCopied ? "Copied!" : ""}</div>
                </div>
              </div>

            </div>
            <div className="">
              {claimables && claimables.filter((claimable) => claimable.amount > 0).length > 0 ? (
                <>
                  <div className="">$4152 EARNED</div>
                  <Button onClick={() => {
                    setShowCoinflow(!showCoinflow);
                  }}>Cash Out</Button>
                  {showCoinflow && <CoinflowOfframp />}
                </>
              ) : 
                <>
                  <div className="my-6 uppercase text-green-800"><span className="text-4xl mr-1">$4,152</span> earned</div>
                  <Button className="border bg-primaryBtn border-primaryBtnBorder text-lg rounded-md px-6 py-3 uppercase font-bold text-textGreen" onClick={() => {
                    setShowCoinflow(!showCoinflow);
                  }}>Cash Out</Button>
                  {showCoinflow && <CoinflowOfframp />}
                </>
              }
            </div>
          </div>
        ) : (
          <div>

            {/* <p className="uppercase">You do not have a link currently</p> */}
            <p className="uppercase pb-1 px-1 text-green-700 font-medium">Share to earn 1% of each referral</p>
            <div className="flex items-center px-4 py-4 bg-white border border-primaryBtnBorder uppercase rounded-md gap-2">
              <Button className="text-green-500 text-sm" onClick={handleCreateLink}>Generate Referral Link</Button>
            </div>
          </div>
        )}
      </div>
      <div className="w-full md:w-[345px] rounded-xl bg-bgLancerSecondary/[8%] overflow-hidden p-6 text-green-700 font-medium">
          <p className="font-bold text-2xl text-textGreen mb-6">How it Works</p>
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
  )
}