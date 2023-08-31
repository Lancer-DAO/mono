import { useUserWallet } from "@/src/providers";
import { useReferral } from "@/src/providers/referralProvider";
import { api } from "@/src/utils/api";
import { Treasury } from "@ladderlabs/buddy-sdk";
import * as Prisma from "@prisma/client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IAsyncResult, ProfileNFT } from "@/types/";
import { Button } from "@/components";
import { IS_CUSTODIAL, USDC_MINT } from "@/src/constants";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import {
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  getAccount,
  TokenAccountNotFoundError,
} from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";

dayjs.extend(relativeTime);

const SITE_URL = `https://${IS_CUSTODIAL ? "app" : "pro"}.lancer.so/account?r=`;

export const ProfileNFTCard = ({
  profileNFT,
  picture,
  githubId,
}: {
  profileNFT: ProfileNFT;
  picture: string;
  githubId: string;
}) => {
  // state
  const [showCoinflow, setShowCoinflow] = useState(false);
  const [showReferrerModal, setShowReferrerModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [signature, setSignature] = useState("");
  const [balance, setBalance] = useState<IAsyncResult<number>>({
    isLoading: true,
    loadingPrompt: "Loading Balance",
  });
  const [amount, setAmount] = useState(0);
  const [sendToPublicKey, setSentToPublicKey] = useState("");

  // context + api
  const { referralId, initialized, createReferralMember, claimables, claim } =
    useReferral();
  const { connection } = useConnection();
  const { currentWallet } = useUserWallet();
  const { data: allMints } = api.mints.getMints.useQuery();

  useEffect(() => {
    const getBalanceAsync = async () => {
      try {
        const usdcAccountAddress = getAssociatedTokenAddressSync(
          new PublicKey(USDC_MINT),
          currentWallet.publicKey
        );
        const usdcAccount = await getAccount(connection, usdcAccountAddress);
        console.log(usdcAccount);
        const balance = parseFloat(usdcAccount.amount.toString()) / 10.0 ** 6;
        setBalance({ result: balance, isLoading: false });
      } catch (err) {
        if (err instanceof TokenAccountNotFoundError) {
          setBalance({ error: err, result: 0 });
        } else {
          console.error(err);
        }
      }
    };
    if (currentWallet.publicKey) {
      getBalanceAsync();
    }
  }, [currentWallet?.publicKey]);

  const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSentToPublicKey(event.target.value);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(event.target.value));
  };

  const handleSendClick = async () => {
    const sendUSDC = async (sourceTokenAccount, destTokenAccount) => {
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      const txInfo = {
        /** The transaction fee payer */
        feePayer: currentWallet.publicKey,
        /** A recent blockhash */
        blockhash: blockhash,
        /** the last block chain can advance to before tx is exportd expired */
        lastValidBlockHeight: lastValidBlockHeight,
      };
      const tx = new Transaction(txInfo).add(
        createTransferInstruction(
          sourceTokenAccount,
          destTokenAccount,
          currentWallet.publicKey,
          amount * 10 ** 4
        )
      );
      const signature2 = await currentWallet.signAndSendTransaction(tx);
      setSignature(signature2);
      setSentToPublicKey("");
    };
    if (sendToPublicKey.trim() !== "") {
      const destPK = new PublicKey(sendToPublicKey);
      let destTokenAccount: PublicKey;
      destTokenAccount = getAssociatedTokenAddressSync(
        new PublicKey(USDC_MINT),
        destPK
      );
      const sourceTokenAccount = getAssociatedTokenAddressSync(
        new PublicKey(USDC_MINT),
        currentWallet.publicKey
      );
      try {
        const tokenAccount = await getAccount(connection, destTokenAccount);
        sendUSDC(sourceTokenAccount, destTokenAccount);
      } catch (e) {
        const ix = await createAssociatedTokenAccountInstruction(
          currentWallet.publicKey,
          destTokenAccount,
          destPK,
          new PublicKey(USDC_MINT)
        );
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        const txInfo = {
          /** The transaction fee payer */
          feePayer: currentWallet.publicKey,
          /** A recent blockhash */
          blockhash: blockhash,
          /** the last block chain can advance to before tx is exportd expired */
          lastValidBlockHeight: lastValidBlockHeight,
        };
        const tx = new Transaction(txInfo).add(ix);
        const signature = await currentWallet.signAndSendTransaction(tx);
        console.log(signature);
        setTimeout(async () => {
          sendUSDC(sourceTokenAccount, destTokenAccount);
        }, 2000);
      }
    }
  };
  const handleCreateLink = useCallback(async () => {
    await createReferralMember();

    // TODO: success logic
  }, [initialized]);

  const handleClaim = async (amount: number, treasury: Treasury) => {
    if (amount) await claim(treasury);
  };

  const claimButtons = useMemo(() => {
    return claimables
      .filter((claimable) => claimable.amount !== 0)
      .map((claimable, index) => {
        const claimMintKey = claimable.treasury.account.mint.toString();
        const claimMint = new PublicKey(USDC_MINT);
        return (
          <Button
            key={`${claimable.treasury.account}-${index}`}
            onClick={() => handleClaim(claimable.amount, claimable.treasury)}
          >
            Claim {claimable.amount} {"USDC"}
          </Button>
        );
      });
  }, [claimables, allMints]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleCopyClick = (text: string) => {
    copyToClipboard(text);
    setTimeout(() => setIsCopied(false), 2000); // Reset the isCopied state after 2 seconds
  };

  return (
    <div className="w-full md:w-[460px] rounded-xl bg-bgLancerSecondary/[8%] overflow-hidden p-6 text-textGreen">
      <div className="flex flex-col gap-3">
        {(picture || githubId) && (
          <Image
            src={
              picture
                ? picture
                : "/assets/images/Lancer-Green-No-Background-p-800.png"
            }
            width={58}
            height={58}
            alt={profileNFT?.name.split("for ")[1]}
            className="rounded-full overflow-hidden"
          />
        )}

        <div className="flex items-start gap-16 pb-6">
          {/* Labels column */}
          <div className="flex flex-col gap-4 text-lg">
            <p>name</p>
            {/* <p>username</p> */}
            <p>industry</p>
            {/* <p>location</p> */}
            <p>xp</p>
          </div>
          {/* Data column */}
          <div className="flex flex-col gap-4 text-lg text-textPrimary">
            <p>{profileNFT?.name}</p>
            {/* <p>{currentUser?.name}</p> */}
            {/* TODO: hard coded */}
            <div className="flex items-center gap-2">
              <Image
                src="/assets/icons/eng.png"
                width={25}
                height={25}
                alt="eng"
              />
              <p>Engineering</p>
            </div>
            {/* <p>[location]</p> */}
            <p>{profileNFT?.reputation} pts</p>
          </div>
        </div>
      </div>
    </div>
  );
};
