import { LinkButton } from "@/components";
import { useUserWallet } from "@/src/providers";
import { useRouter } from "next/router";

const LEADERBOARD_LINKS = [
  {
    href: "/leaderboard",
    children: "Quests",
  },
  {
    href: "/leaderboard/contributions",
    children: "Contributions",
  },
  {
    href: "/leaderboard/commits",
    children: "Commits",
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
  return (
    <div className="flex gap-8 items-center mb-10 w-fit">
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
