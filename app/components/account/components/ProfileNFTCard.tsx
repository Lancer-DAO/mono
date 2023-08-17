import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { IAsyncResult, ProfileNFT } from "@/types/";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Button,
  CoinflowOfframp,
  AddReferrerModal,
  LinkButton,
} from "@/components";
import { useReferral } from "@/src/providers/referralProvider";
import { Copy } from "react-feather";
import { Treasury } from "@ladderlabs/buddy-sdk";
import { api } from "@/src/utils/api";
import * as Prisma from "@prisma/client";
import { IS_CUSTODIAL, USDC_MINT } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import {
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  getAccount,
  TokenAccountNotFoundError,
} from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import { roundDownToTwoDecimals } from "@/src/utils";

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
  const [showCoinflow, setShowCoinflow] = useState(false);
  const [showReferrerModal, setShowReferrerModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [signature, setSignature] = useState("");
  const [balance, setBalance] = useState<IAsyncResult<number>>({
    isLoading: true,
    loadingPrompt: "Loading Balance",
  });
  const { referralId, initialized, createReferralMember, claimables, claim } =
    useReferral();
  const { connection } = useConnection();
  const [amount, setAmount] = useState(0);
  const { currentUser, currentWallet } = useUserWallet();
  const [sendToPublicKey, setSentToPublicKey] = useState("");
  const { mutateAsync: getMintsAPI } = api.mints.getMints.useMutation();
  const [mints, setMints] = useState<Prisma.Mint[]>([]);

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
        skipPreflight: true,
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
          skipPreflight: true,
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
      .map((claimable) => {
        const claimMintKey = claimable.treasury.account.mint.toString();
        const claimMint = mints.filter(
          (mint) => mint.publicKey === claimMintKey
        )[0];
        return (
          <Button
            onClick={() => handleClaim(claimable.amount, claimable.treasury)}
          >
            Claim {claimable.amount} {claimMint?.ticker}
          </Button>
        );
      });
  }, [claimables, mints]);

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

  useEffect(() => {
    const getMints = async () => {
      const mints = await getMintsAPI();
      setMints(mints);
    };
    if (!!currentUser) {
      getMints();
    }
  }, [currentUser]);

  return (
    <div className="w-full md:w-[460px] rounded-xl bg-bgLancerSecondary/[8%] overflow-hidden p-6">
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
            alt={profileNFT.name.split("for ")[1]}
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
            <p>exp</p>
          </div>
          {/* Data column */}
          <div className="flex flex-col gap-4 text-lg font-bold">
            <p>{currentUser?.name}</p>
            {/* <p>{currentUser?.name}</p> */}
            {/* hard coded */}
            <div className="flex items-center gap-2">
              <Image
                src="/assets/icons/eng.png"
                width={25}
                height={25}
                alt="eng"
              />
              <p className="font-bold">Engineering</p>
            </div>
            {/* <p>[location]</p> */}
            <p>{profileNFT.reputation} pts</p>
          </div>
        </div>

        {/* 
        <div>
          <div className="divider"></div>

          <h4>Certificates</h4>
          {profileNFT.certifications?.length > 0 ? (
            <div className="tag-list">
              {profileNFT.certifications.map((badge) => (
                <div className="tag-item" key={badge}>
                  {badge}
                </div>
              ))}
            </div>
          ) : (
            <div>No certificates yet!</div>
          )}
        </div>
        <div>
          <div className="divider"></div>

          <h4>Last Updated</h4>
          <div>{profileNFT.lastUpdated?.fromNow()}</div>
        </div>

        <div>
          <div className="divider"></div>

          // TODO: Move this to its own component @scammo
          <h4>Refer your friends</h4>
          {referralId && initialized ? (
            <div className="relative w-full">
              <div className="flex items-center gap-2">
                <span className="text-blue-300">
                  {SITE_URL}
                  {referralId}
                </span>
                <Copy
                  className="cursor-pointer"
                  onClick={() => handleCopyClick(`${SITE_URL}${referralId}`)}
                />
              </div>
              <div className="absolute right-0 text-base">
                {isCopied ? "Copied!" : ""}
              </div>
            </div>
          ) : (
            <div>
              <Button className="mb-6" onClick={handleCreateLink}>
                Generate link
              </Button>
            </div>
          )}
        </div>

        <div>
          {claimables &&
          claimables.filter((claimable) => claimable.amount > 0).length > 0 ? (
            <>
              <div className="divider"></div>
              <h4>Claim your rewards</h4>
              {claimButtons}
            </>
          ) : null}
        </div>
        <div>
          <div className="divider" />
          <div className="my-[10px]">
            <Button
              onClick={() => {
                setShowCoinflow(!showCoinflow);
              }}
            >
              Cash Out
            </Button>
          </div>

          {showCoinflow && <CoinflowOfframp />}
          {IS_CUSTODIAL && (
            <>
              <h2>Send USD to Address</h2>
              {!balance.isLoading && (
                <div>{`Balance: $${roundDownToTwoDecimals(
                  balance.result
                )}`}</div>
              )}
              <div className="">
                <input
                  type="text"
                  className="input w-input"
                  value={sendToPublicKey}
                  onChange={handleMessageChange}
                  placeholder="Paste Public Key"
                />
                <input
                  type="number"
                  className="input w-input"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Amount"
                />
                <Button
                  onClick={handleSendClick}
                  disabled={signature !== ""}
                  extraClasses="mt-6"
                >
                  {`Sen${signature === "" ? "d" : "t"}: $${amount / 10.0 ** 2}`}
                </Button>

                {!!signature && (
                  <LinkButton
                    href={`https://solscan.io/tx/${signature}`}
                    onClick={handleSendClick}
                    wrapperClasses="mt-6"
                    target="_blank"
                  >
                    View Transaction
                  </LinkButton>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <AddReferrerModal
        setShowModal={setShowReferrerModal}
        showModal={showReferrerModal}
      /> */}
      </div>
    </div>
  );
};
