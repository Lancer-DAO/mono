import { LinkButton } from "@/components";
import { useUserWallet } from "@/src/providers";
import { useRouter } from "next/router";

const LEADERBOARD_LINKS = [
  {
    href: "/leaderboard",
    children: "Contributions",
  },
  {
    href: "/leaderboard/commits",
    children: "Commits",
  },
  {
    href: "/leaderboard/quests",
    children: "Quests",
  },
  {
    href: "/leaderboard/earners",
    children: "Earners",
  },
];

export const LeaderBoardSelector = () => {
  const { currentUser } = useUserWallet();
  const router = useRouter();
  const currentLeaderboard = router.pathname;
  const links = LEADERBOARD_LINKS.slice(0, currentUser?.isAdmin ? 4 : 3);
  console.log(currentLeaderboard);
  return (
    <div className="flex gap-8 items-center w-full mb-10 ml-28">
      {links.map(({ href, children }, index) => {
        return (
          <LinkButton
            href={href}
            className={`text-lg font-bold ${
              currentLeaderboard === href ? "" : "opacity-50"
            }`}
            key={href}
          >
            {children}
          </LinkButton>
        );
      })}
    </div>
  );
};
