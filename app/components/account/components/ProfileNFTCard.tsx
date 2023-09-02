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
import { api } from "@/src/utils";
import { Check, Edit, X } from "react-feather";
import { Button } from "@/components";
import { BountyActionsButton } from "@/components/bounties/Bounty/components";
import { useChat } from "@/src/providers/chatProvider";

dayjs.extend(relativeTime);

export const ProfileNFTCard = ({
  profileNFT,
  picture,
  githubId,
  user,
  self,
}: {
  profileNFT: ProfileNFT;
  picture: string;
  githubId: string;
  user: User;
  self?: boolean;
}) => {
  // state
  const [signature, setSignature] = useState("");
  const { mutateAsync: updateName } = api.users.updateName.useMutation();
  const { mutateAsync: updateIndustry } =
    api.users.updateIndustry.useMutation();
  const [nameEdit, setNameEdit] = useState({ editing: false, name: user.name });
  const [industryEdit, setIndustryEdit] = useState({
    editing: false,
    industry: user.industries[0],
  });
  const { setIsChatOpen } = useChat();

  const [balance, setBalance] = useState<IAsyncResult<number>>({
    isLoading: true,
    loadingPrompt: "Loading Balance",
  });
  const [amount, setAmount] = useState(0);
  const [sendToPublicKey, setSentToPublicKey] = useState("");

  const {
    data: allIndustries,
    isLoading: industriesLoading,
    isError: industriesError,
  } = api.industries.getAllIndustries.useQuery();

  // context + api
  const { connection } = useConnection();
  const { currentWallet, currentUser } = useUserWallet();

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
        <div className="flex items-center justify-between"></div>

        <div className="flex items-start gap-16 pb-6">
          {/* Labels column */}
          <div className="flex flex-col gap-4 text-lg">
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
            <p>name</p>
            <p>industry</p>
            {/* <p>location</p> */}
            <p>xp</p>
          </div>
          {/* Data column */}
          <div className="flex flex-col gap-4 text-lg text-textPrimary w-full">
            {currentUser.hasBeenApproved && (
              <BountyActionsButton
                onClick={() => {
                  setIsChatOpen(true);
                }}
                type="green"
                text="Send Message"
                extraClasses="w-fit"
              />
            )}
            <div className="flex w-fill">
              {nameEdit.editing ? (
                <input
                  type="text"
                  className="placeholder:text-textGreen/70 border bg-neutralBtn 
            border-neutralBtnBorder h-[30px] rounded-lg px-3"
                  name="company"
                  placeholder="ex. Jack Sturt"
                  id="profile-company"
                  value={nameEdit.name}
                  onChange={(e) =>
                    setNameEdit({ ...nameEdit, name: e.target.value })
                  }
                />
              ) : (
                <p>{nameEdit.name}</p>
              )}
              {self && (
                <div className="ml-auto">
                  {nameEdit.editing ? (
                    <>
                      <button
                        onClick={() => {
                          updateName({ name: nameEdit.name });
                          setNameEdit({ ...nameEdit, editing: false });
                        }}
                        className="rounded-md uppercase font-bold text-textGreen mr-2"
                      >
                        <Check />
                      </button>
                      <button
                        onClick={() =>
                          setNameEdit({ editing: false, name: user.name })
                        }
                        className="rounded-md uppercase font-bold text-textRed"
                      >
                        <X />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setNameEdit({ editing: true, name: "" })}
                      className="rounded-md uppercase font-bold text-textGreen"
                    >
                      <Edit />
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {industryEdit.editing ? (
                allIndustries.map((industry) => (
                  <Image
                    src={industry.icon}
                    width={25}
                    height={25}
                    alt="eng"
                    key={industry.id}
                    onClick={() =>
                      setIndustryEdit({
                        ...industryEdit,
                        industry: industry,
                      })
                    }
                    className={
                      industry.id === industryEdit.industry.id
                        ? `"border-2 border-[${industry.color}] rounded-full"`
                        : "rounded-full opacity-50 hover:opacity-100 cursor-pointer"
                    }
                  />
                ))
              ) : (
                <>
                  <Image
                    src={industryEdit.industry.icon}
                    width={25}
                    height={25}
                    alt="eng"
                  />
                  <p>{industryEdit.industry.name}</p>
                </>
              )}
              {self && (
                <div className="ml-auto items-center">
                  {industryEdit.editing ? (
                    <>
                      <button
                        onClick={() => {
                          updateIndustry({
                            newIndustryId: industryEdit.industry.id,
                            oldIndustryId: user.industries[0].id,
                          });
                          setIndustryEdit({ ...industryEdit, editing: false });
                        }}
                        className="rounded-md uppercase font-bold text-textGreen mr-2"
                      >
                        <Check />
                      </button>
                      <button
                        onClick={() =>
                          setIndustryEdit({
                            editing: false,
                            industry: user.industries[0],
                          })
                        }
                        className="rounded-md uppercase font-bold text-textRed"
                      >
                        <X />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() =>
                        setIndustryEdit({
                          editing: true,
                          industry: user.industries[0],
                        })
                      }
                      className="rounded-md uppercase font-bold text-textGreen"
                    >
                      <Edit />
                    </button>
                  )}
                </div>
              )}
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
