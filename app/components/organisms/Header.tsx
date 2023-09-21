import Link from "next/link";
import { AccountHeaderOptions, TutorialsModal, LinkButton } from "@/components";
import { HelpCircle } from "react-feather";
import { useEffect, useState } from "react";
import { PROFILE_TUTORIAL_INITIAL_STATE } from "@/src/constants/tutorials";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { useAppContext } from "@/src/providers/appContextProvider";
import { IS_CUSTODIAL } from "@/src/constants";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUserWallet } from "@/src/providers";
import { useChat } from "@/src/providers/chatProvider";
import Image from "next/image";
import { useRouter } from "next/router";
import { ChevronsUpDown } from "lucide-react";
import { useBounty } from "@/src/providers/bountyProvider";
import { BountyPreview } from "@/types";

const HEADER_LINKS = [
  {
    href: "/create",
    children: "New Quest",
    id: "create-bounty-link",
  },
  {
    href: "/quests",
    children: "Quests",
    id: "bounties-link",
  },
  ,
  {
    href: "/leaderboard",
    children: "Leaderboards",
    id: "leaderboards-link",
  },
];

export const Header = () => {
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const { isRouterReady } = useAppContext();
  const [isTutorialButtonHovered, setIsTutorialButtonHovered] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  const { currentUser } = useUserWallet();
  const { allBounties } = useBounty();
  const { publicKey } = useWallet();
  const { currentWallet } = useUserWallet();

  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<BountyPreview | null>(
    null
  );
  const [myQuests, setMyQuests] = useState<BountyPreview[]>([]);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  useEffect(() => {
    const myBounties = allBounties?.filter((bounty) =>
      bounty.users.some((user) => user.userid === currentUser?.id)
    );
    console.log("bounties", allBounties, myBounties, currentUser);
    setMyQuests(myBounties);
  }, [currentUser, allBounties]);

  return (
    <div className="py-4 fixed w-full top-0 z-40 bg-white">
      <div className="flex items-center gap-8 mx-auto w-[95%] justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-1">
            <Image
              src="/assets/images/lancer_logo_flat.png"
              width={24}
              height={24}
              alt="Lancer logo flat"
            />
            <p className="text-xl text-primary300 font-bold">Lancer</p>
          </Link>
          {myQuests?.length > 0 && (
            <div className="flex flex-col relative">
              <div
                className="rounded-md text-neutral500 border border-neutral200 
                bg-neutral100 px-2 py-[6px] text-mini h-[34px] flex justify-between 
                items-center gap-1 w-32"
                onClick={toggleDropdown}
              >
                {selectedQuest.title || "My Quests"}
                <ChevronsUpDown height={12} width={12} />
              </div>
              {dropdownOpen && (
                <div className="absolute top-full left-0 z-10 bg-secondary200 p-[5px] rounded-md text-mini text-white w-full">
                  {myQuests.map((quest) => (
                    <div
                      key={quest.id}
                      className="px-2 py-[6px]"
                      onClick={() => setSelectedQuest(quest)}
                    >
                      {quest.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-4 items-center justify-center w-full">
          {currentUser &&
            HEADER_LINKS.map(({ href, children, id }) => {
              return (
                <LinkButton
                  href={href}
                  active={router.pathname.includes(href)}
                  className="text-sm text-neutral-500"
                  key={href}
                  disabled={
                    (id === "create-bounty-link" &&
                      !currentUser.hasBeenApproved) ||
                    !currentUser?.hasFinishedOnboarding
                  }
                  disabledText={"You must be approved to create a Quest"}
                >
                  {children}
                </LinkButton>
              );
            })}
        </div>
        <div className={`flex items-center gap-8`}>
          {<AccountHeaderOptions />}

          {!IS_CUSTODIAL && (
            <div
              onClick={() => {
                if (
                  !!currentTutorialState &&
                  currentTutorialState?.title ===
                    PROFILE_TUTORIAL_INITIAL_STATE.title &&
                  currentTutorialState.currentStep === 1
                ) {
                  setCurrentTutorialState({
                    ...currentTutorialState,
                    isRunning: false,
                  });
                  return;
                }
              }}
            >
              <WalletMultiButton
                className="flex h-[48px] px-8 py-[6px] items-center justify-center
                !border-solid !bg-primaryBtn !border-primaryBtnBorder !border
                !text-textGreen !rounded-md !whitespace-nowrap !font-base"
                startIcon={undefined}
              >
                {currentWallet?.publicKey
                  ? currentWallet.publicKey.toBase58().slice(0, 4) +
                    " ... " +
                    currentWallet?.publicKey.toBase58().slice(-4)
                  : "Connect"}
              </WalletMultiButton>
            </div>
          )}
        </div>
        {/* <button
            onClick={() => {
              setShowTutorialModal(true);
            }}
            onMouseEnter={() => setIsTutorialButtonHovered(true)}
            onMouseLeave={() => setIsTutorialButtonHovered(false)}
            id="start-tutorial-link"
            className="flex rounded-full h-[48px] w-[48px] gap-[10px] py-[6px] 
            items-center justify-center"
          >
            <HelpCircle
              height={48}
              width={48}
              strokeWidth={1.25}
              color={isTutorialButtonHovered ? "#fff" : "#C5FFBA"}
            />
          </button> */}
        {isRouterReady && (
          <TutorialsModal
            setShowModal={setShowTutorialModal}
            showModal={showTutorialModal}
          />
        )}
      </div>
    </div>
  );
};

export default Header;
