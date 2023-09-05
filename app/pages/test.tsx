import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { Bounties } from "@/components/bounties/Bounties/Bounties";
import { NextSeo } from "next-seo";
import { useUserWallet } from "@/src/providers";
import {
  createFFA,
  sendInvoice,
  acceptInvoice,
  rejectInvoice,
  closeInvoice,
  addSubmitterFFAOld,
  submitRequestFFA,
  approveRequestFFAOld,
} from "@/escrow/adapters";
import { PublicKey } from "@solana/web3.js";
import { USDC_MINT } from "@/src/constants";
import { Escrow, IAsyncResult } from "@/types";
import { HuddleIframe } from "@huddle01/iframe";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { LoadingBar } from "@/components";
export const getServerSideProps = withPageAuthRequired();

const BountiesPage: React.FC = () => {
  const [roomUrl, setRoomUrl] = useState<IAsyncResult<string>>({
    isLoading: true,
  });
  useEffect(() => {
    const getRoomUrl = async () => {
      const response = await axios.post(
        "https://api.huddle01.com/api/v1/create-iframe-room",
        {
          title: "Huddle01-Test",
          hostWallets: ["0xdd305d192E3A69085E5D2756b0469B4fDD03b245"],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_HUDDLE_01_API_KEY,
          },
        }
      );
      const meetingURI = response.data.data.roomId;
      console.log("meetingLink", meetingURI);
      setRoomUrl({ isLoading: false, result: meetingURI });
    };
    getRoomUrl();
  }, []);

  return (
    <>
      <NextSeo title="Lancer | Call" description="Lancer Call" />
      <div className="h-full w-full">
        {roomUrl.isLoading ? (
          <LoadingBar title="Loading Meeting" />
        ) : (
          <HuddleIframe
            roomUrl={`https://lancer.huddle01.com/${roomUrl.result}`}
            className="w-full h-full aspect-video bg-industryRedBorder"
          />
        )}
      </div>
    </>
  );
};

export default BountiesPage;
