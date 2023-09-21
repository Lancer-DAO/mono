import { CashoutModal } from "@/components";
import { QuestActionsButton } from "@/components/quests/Quest/components";
import { IS_CUSTODIAL, USDC_MINT } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { useAccount } from "@/src/providers/accountProvider";
import { useChat } from "@/src/providers/chatProvider";
import { useIndustry } from "@/src/providers/industryProvider";
import { api } from "@/src/utils";
import { createDM } from "@/src/utils/sendbird";
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
import Image from "next/image";
import { useEffect, useState } from "react";
import { Check, Edit, X } from "react-feather";
import toast from "react-hot-toast";
import LinksCard from "./LinksCard";

dayjs.extend(relativeTime);

export const ProfileNFTCard = ({
  picture,
  githubId,
  user,
  self,
  id,
}: {
  picture: string;
  githubId: string;
  user: User;
  self?: boolean;
  id: number;
}) => {
  // state
  const [showCashout, setShowCashout] = useState(false);
  const [approvalText, setApprovalText] = useState("Approve");
  const [nameEdit, setNameEdit] = useState({ editing: false, name: user.name });
  const [industryEdit, setIndustryEdit] = useState({
    editing: false,
    industry: user.industries[0],
  });
  const [bioEdit, setBioEdit] = useState({ editing: false, bio: user.bio });
  const [balance, setBalance] = useState<IAsyncResult<number>>({
    isLoading: true,
    loadingPrompt: "Loading Balance",
  });
  const [amount, setAmount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [sendToPublicKey, setSentToPublicKey] = useState("");

  // context + api
  const { connection } = useConnection();
  const { currentWallet, currentUser } = useUserWallet();
  const { allIndustries } = useIndustry();
  const { mutateAsync: updateName } = api.users.updateName.useMutation();
  const { mutateAsync: updateBio } = api.users.updateBio.useMutation();
  const { mutateAsync: updateIndustry } =
    api.users.updateIndustry.useMutation();
  const { mutateAsync: approveUser } = api.users.approveUser.useMutation();
  const { setIsChatOpen, setCurrentChannel } = useChat();
  const { refetch: refetchUser } = api.users.getUser.useQuery(
    {
      id: currentUser?.id,
    },
    {
      enabled: !!currentUser,
    }
  );

  const { account, setAccount } = useAccount();

  useEffect(() => {
    const getBalanceAsync = async () => {
      try {
        const usdcAccountAddress = getAssociatedTokenAddressSync(
          new PublicKey(USDC_MINT),
          currentWallet.publicKey
        );
        const usdcAccount = await getAccount(connection, usdcAccountAddress);
        // console.log(usdcAccount);
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
    if (currentWallet?.publicKey) {
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
                src={picture ? picture : "/assets/images/lancer_logo_flat.png"}
                width={58}
                height={58}
                alt={user?.name.split("for ")[1]}
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
            <div className="flex">
              {currentUser.hasBeenApproved && !self ? (
                <QuestActionsButton
                  onClick={async () => {
                    const url = await createDM([
                      String(currentUser.id),
                      String(id),
                    ]);
                    setCurrentChannel({ url });
                    setIsChatOpen(true);
                  }}
                  type="green"
                  text="Send Message"
                  extraClasses="w-fit mb-[6px]"
                />
              ) : self ? (
                <QuestActionsButton
                  onClick={async () => {
                    setShowCashout(true);
                  }}
                  type="green"
                  text="Cash Out"
                  extraClasses="w-fit mb-[6px]"
                />
              ) : (
                <div className="h-[56px]"></div>
              )}
              {currentUser.isAdmin && !self && !user.hasBeenApproved && (
                <QuestActionsButton
                  onClick={async () => {
                    approveUser({ id: user.id });
                    setApprovalText("Approved");
                  }}
                  type="green"
                  text={approvalText}
                  extraClasses="w-fit mb-[6px] ml-2"
                />
              )}
            </div>
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
                          if (nameEdit.name === "") {
                            toast.error("Name cannot be empty");
                            return;
                          }
                          updateName({ name: nameEdit.name });
                          setNameEdit({ ...nameEdit, editing: false });
                          setAccount({ ...account, name: nameEdit.name });
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
                      <Edit className="w-5" />
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
                      <Edit className="w-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
            {/* <p>[location]</p> */}
            <p>{0} pts</p>
          </div>
        </div>
        {bioEdit.editing ? (
          <div>
            <textarea
              className="placeholder:text-textGreen/70 border bg-neutralBtn min-h-[50px] 
              border-neutralBtnBorder w-full h-[150px] rounded-lg px-3 py-2 resize-y max-h-[300px]"
              name="bio"
              placeholder="Add bio"
              id="profile-bio"
              maxLength={500}
              value={bioEdit.bio}
              onChange={(e) => {
                setCharCount(e.target.value.length);
                setBioEdit({ ...bioEdit, bio: e.target.value });
              }}
            />
            <div className="w-full flex justify-between items-center">
              <p
                className={`text-sm ${
                  charCount > 450 ? "text-red-500" : "text-gray-500"
                }`}
              >
                {charCount}/500
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    updateBio({ bio: bioEdit.bio });
                    setBioEdit({ ...bioEdit, editing: false });
                    setAccount({ ...account, bio: bioEdit.bio });
                  }}
                  className="rounded-md uppercase font-bold text-textGreen mr-2"
                >
                  <Check />
                </button>
                <button
                  onClick={() =>
                    setBioEdit({
                      editing: false,
                      bio: user.bio,
                    })
                  }
                  className="rounded-md uppercase font-bold text-textRed"
                >
                  <X />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <p className="text-textPrimary pr-5 leading-5">
              {bioEdit.bio !== "" ? bioEdit.bio : "Add a short bio here"}
            </p>
            {self && (
              <button
                onClick={() =>
                  setBioEdit({
                    editing: true,
                    bio: user.bio,
                  })
                }
                className="rounded-md uppercase font-bold text-textGreen"
              >
                <Edit className="w-5" />
              </button>
            )}
          </div>
        )}

        <LinksCard />
      </div>
      {showCashout && <CashoutModal setShowModal={setShowCashout} />}
    </div>
  );
};
