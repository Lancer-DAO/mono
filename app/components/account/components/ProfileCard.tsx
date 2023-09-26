import { CashoutModal } from "@/components";
import { QuestActionsButton } from "@/components/quests/Quest/components";
import { USDC_MINT } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { useAccount } from "@/src/providers/accountProvider";
import { useChat } from "@/src/providers/chatProvider";
import { useIndustry } from "@/src/providers/industryProvider";
import { api } from "@/src/utils";
import { createDM } from "@/src/utils/sendbird";
import { IAsyncResult, User } from "@/types/";
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
import { useEffect, useRef, useState } from "react";
import { Check, Edit, X } from "react-feather";
import LinksCard from "./LinksCard";
import { BadgesCard } from "./BadgesCard";
import { useOutsideAlerter } from "@/src/hooks";
import { ChevronsUpDown } from "lucide-react";

dayjs.extend(relativeTime);

export const ProfileCard = ({
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const wrapperRef = useRef(null);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  useOutsideAlerter(wrapperRef, () => {
    setDropdownOpen(false);
  });

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

  useEffect(() => {
    if (!!user) {
      setCharCount(user.bio.length);
    }
  }, [user]);

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
    <div
      className="bg-white w-full border 
      border-neutral200 rounded-md overflow-hidden"
    >
      <div className="flex items-start justify-between p-5">
        <div className="flex items-center gap-5">
          <Image
            src={picture}
            width={65}
            height={65}
            alt="profile picture"
            className="rounded-full overflow-hidden"
          />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-neutral600">{user.name}</h1>
              {self && !nameEdit.editing && (
                <button
                  onClick={() =>
                    setNameEdit({
                      editing: true,
                      name: user.name,
                    })
                  }
                  className="rounded-md uppercase font-bold text-neutral500"
                >
                  <Edit className="w-4" />
                </button>
              )}
            </div>
            <div className="flex gap-3 items-center">
              <div className="px-2 py-1 rounded-md bg-neutral100 border border-neutral200">
                <p className="text-neutral500 text-sm">
                  {user.industries[0].name}
                </p>
              </div>
              <div className="w-[1px] h-7 bg-neutral200" />
              <p className="text-neutral500">{`${user.experience} XP`}</p>
            </div>
          </div>
        </div>
        {currentUser.hasBeenApproved && !self ? (
          <QuestActionsButton
            onClick={async () => {
              const url = await createDM([String(currentUser.id), String(id)]);
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
            extraClasses="w-fit"
          />
        ) : (
          <div className="h-[56px]"></div>
        )}
        {currentUser.isAdmin && !self && !user.hasBeenApproved && (
          <QuestActionsButton
            onClick={async () => {
              approveUser({ email: user.email });
              setApprovalText("Approved");
            }}
            type="green"
            text={approvalText}
            extraClasses="w-fit mb-[6px] ml-2"
          />
        )}
      </div>
      <div className="h-[1px] w-full bg-neutral200" />
      <div className="w-full p-5">
        <div className="w-full flex items-center gap-2 mb-3">
          {nameEdit.editing || industryEdit.editing ? (
            <>
              {/* name input field */}
              <div className="w-full flex items-center gap-2">
                <p className="text-neutral600 w-14 text-sm">Name</p>
                <input
                  type="text"
                  value={nameEdit.name}
                  onChange={(e) =>
                    setNameEdit({ ...nameEdit, name: e.target.value })
                  }
                  className="placeholder:text-neutral400 w-40 
                  p-2 bg-neutral100 border border-neutral200 
                  rounded-md gap-2 text-neutral500 text-sm"
                  placeholder="Anatoly Yakovenko"
                />
              </div>
              {/* industry input field */}
              <div className="w-full flex items-center gap-2">
                <p className="text-neutral600 w-14 text-sm">Industry</p>
                <div className="relative" ref={wrapperRef}>
                  <div
                    className="rounded-md border border-neutral200 bg-neutral100 
                    px-3 py-2 h-9 w-40 flex items-center justify-between gap-2 cursor-pointer"
                    onClick={toggleDropdown}
                  >
                    <p className="text-neutral500 w-full truncate text-mini">
                      {industryEdit.industry.name}
                    </p>
                    <div className="w-3">
                      <ChevronsUpDown height={12} width={12} />
                    </div>
                  </div>
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 z-10 bg-secondary200 p-[5px] rounded-md text-mini text-white w-full">
                      {allIndustries.map((i) => (
                        <div
                          key={i.id}
                          className="p-2 truncate cursor-pointer"
                          onClick={() => {
                            if (industryEdit.industry?.id !== i.id) {
                              setIndustryEdit({ ...industryEdit, industry: i });
                              setDropdownOpen(false);
                            }
                          }}
                        >
                          {i.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    updateName({ name: nameEdit.name });
                    updateIndustry({
                      newIndustryId: industryEdit.industry.id,
                      oldIndustryId: user.industries[0].id,
                    });
                    setNameEdit({ ...nameEdit, editing: false });
                    setIndustryEdit({ ...industryEdit, editing: false });
                    setAccount({
                      ...account,
                      name: nameEdit.name,
                      industries: [industryEdit.industry],
                    });
                  }}
                  className="rounded-md uppercase font-bold text-success"
                >
                  <Check />
                </button>
                <button
                  onClick={() => {
                    setNameEdit({
                      editing: false,
                      name: user.name,
                    });
                    setIndustryEdit({
                      editing: false,
                      industry: user.industries[0],
                    });
                  }}
                  className="rounded-md uppercase font-bold text-error"
                >
                  <X />
                </button>
              </div>
            </>
          ) : null}
        </div>
        <div className="w-full flex items-center gap-2 mb-3">
          <p className="text-neutral600 title-text">Bio</p>
          {self && !bioEdit.editing && (
            <button
              onClick={() =>
                setBioEdit({
                  editing: true,
                  bio: user.bio,
                })
              }
              className="rounded-md uppercase font-bold text-neutral500"
            >
              <Edit className="w-4" />
            </button>
          )}
        </div>
        {bioEdit.editing ? (
          <>
            <textarea
              className="placeholder:text-neutral400/80 border border-neutral200 bg-neutral100
              min-h-[50px] w-full h-[150px] rounded-md p-3 resize-y"
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
                  charCount > 450 ? "text-red-500" : "text-neutral500"
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
                  className="rounded-md uppercase font-bold text-success mr-2"
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
                  className="rounded-md uppercase font-bold text-error"
                >
                  <X />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="border border-neutral200 bg-neutral100 min-h-[50px] w-full rounded-md p-3">
            <p className="text-neutral600">
              {bioEdit.bio !== "" ? bioEdit.bio : "Add a short bio here"}
            </p>
          </div>
        )}
      </div>
      <LinksCard />
      <BadgesCard />
      {showCashout && <CashoutModal setShowModal={setShowCashout} />}
    </div>
  );
};
