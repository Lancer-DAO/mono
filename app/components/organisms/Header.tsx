import Link from "next/link";
import { AccountHeaderOptions, TutorialsModal, LinkButton } from "@/components";
import { HelpCircle } from "react-feather";
import { useEffect, useRef, useState } from "react";
import { PROFILE_TUTORIAL_INITIAL_STATE } from "@/src/constants/tutorials";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { useAppContext } from "@/src/providers/appContextProvider";
import { IS_CUSTODIAL } from "@/src/constants";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useUserWallet } from "@/src/providers";
import Image from "next/image";
import { useRouter } from "next/router";
import { ChevronsUpDown } from "lucide-react";
import { useBounty } from "@/src/providers/bountyProvider";
import { BountyPreview } from "@/types";
import { useOutsideAlerter } from "@/src/hooks";

const HEADER_LINKS = [
  {
    href: "/",
    children: "Home",
    id: "bounties-link",
  },
  {
    href: "/create",
    children: "New Quest",
    id: "create-bounty-link",
  },
  ,
  {
    href: "/leaderboard",
    children: "Leaderboard",
    id: "leaderboards-link",
  },
];

export const Header = () => {
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const { isRouterReady } = useAppContext();
  const [isTutorialButtonHovered, setIsTutorialButtonHovered] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  const { currentUser } = useUserWallet();
  const { myQuests } = useBounty();
  const { currentWallet } = useUserWallet();

  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<BountyPreview | null>(
    null
  );

  const wrapperRef = useRef(null);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  useOutsideAlerter(wrapperRef, () => {
    setDropdownOpen(false);
  });

  // initialize the selected quest if on one of my quests
  useEffect(() => {
    if (router.isReady && !!myQuests) {
      const selectedQuest = myQuests?.find(
        (quest) => quest.id.toString() === (router.query.quest as string)
      );
      setSelectedQuest(selectedQuest);
    }
  }, [router, myQuests]);

  return (
    <div className="py-4 fixed w-full top-0 z-40 bg-white">
      <div className="flex items-center gap-8 mx-auto w-full pl-10 pr-[71px] justify-between">
        <div className="flex items-center gap-12">
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
            <div className="relative" ref={wrapperRef}>
              <div
                className="rounded-md border border-neutral200 bg-neutral100 
                px-3 py-2 h-9 w-40 flex items-center justify-between gap-2 cursor-pointer"
                onClick={toggleDropdown}
              >
                <p className="text-neutral500 w-full truncate text-mini">
                  {!!selectedQuest ? selectedQuest.title : "My Quests"}
                </p>
                <div className="w-3">
                  <ChevronsUpDown height={12} width={12} />
                </div>
              </div>
              {dropdownOpen && (
                <div className="absolute top-full left-0 z-10 bg-secondary200 p-[5px] rounded-md text-mini text-white w-full">
                  {myQuests.map((quest) => (
                    <div
                      key={quest.id}
                      className="p-2 truncate cursor-pointer"
                      onClick={() => {
                        if (selectedQuest?.id !== quest.id) {
                          setSelectedQuest(quest);
                          setDropdownOpen(false);
                          router.push(`/quests/${quest.id}`);
                        }
                      }}
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
                  active={
                    router.pathname === href ||
                    router.pathname.startsWith(`${href}/`)
                  }
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
        <div className={`flex items-center gap-4`}>
          <div className="w-9">
            <AccountHeaderOptions />
          </div>

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
                className="flex !h-9 !py-2 !px-3 items-center justify-center gap-2
                !bg-transparent !border-neutral200 !border !border-solid
                !text-neutral500 !text-xs !rounded-md !whitespace-nowrap !font-base"
                startIcon={undefined}
              >
                {currentWallet?.publicKey
                  ? currentWallet.publicKey.toBase58().slice(0, 4) +
                    " ... " +
                    currentWallet?.publicKey.toBase58().slice(-4)
                  : "Connect"}
                {currentWallet?.publicKey && (
                  <ChevronsUpDown width={12} height={12} />
                )}
              </WalletMultiButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
