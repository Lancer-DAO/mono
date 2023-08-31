import { useEffect, useState } from "react";
import Image from "next/image";
import { IS_CUSTODIAL, USDC_MINT } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { IAsyncResult, ProfileNFT, User } from "@/types/";
import {
  TokenAccountNotFoundError,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import LinksCard from "./LinksCard";

dayjs.extend(relativeTime);

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
  const [signature, setSignature] = useState("");
  const [balance, setBalance] = useState<IAsyncResult<number>>({
    isLoading: true,
    loadingPrompt: "Loading Balance",
  });
  const [amount, setAmount] = useState(0);
  const [sendToPublicKey, setSentToPublicKey] = useState("");

  // context + api
  const { connection } = useConnection();
  const { currentWallet } = useUserWallet();

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
            <p>industry</p>
            {/* <p>location</p> */}
            <p>xp</p>
          </div>
          {/* Data column */}
          <div className="flex flex-col gap-4 text-lg text-textPrimary">
            <p>{profileNFT?.name}</p>
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
        <LinksCard />
      </div>
    </div>
  );
};
