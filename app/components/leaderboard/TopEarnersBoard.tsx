import { api } from "@/src/utils";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { LeaderBoardSelector } from "./components";
import { ArrowDown, ArrowUp, ArrowUpSquare } from "lucide-react";

const languages = [
  "All",
  "TypeScript",
  "JavaScript",
  "CSS",
  "HTML",
  "Python",
  "Ruby",
  "Golang",
  "Java",
  "Rust",
  "Solidity",
  "Csharp",
  "C",
  "Cpp",
  "JSON",
];


export const TopEarnersBoard: FC<any> = () => {
  const [topDevs, setTopDevs] = useState<any[]>([]);
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState<any>()
  const { mutateAsync: getTopEarners } =
    api.leaderboard.getTopEarners.useMutation();
  const { mutateAsync: getTopEarnersLang } =
    api.leaderboard.getTopEarnersLang.useMutation();

  const [changes, setChanges] = useState<any>()

  useEffect(() => {
    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate);
    sevenDaysAgo.setDate(currentDate.getDate() - 7);

    const fetchData = async () => {

      if (!selectedLanguage || selectedLanguage == "All") {
        const res = (await getTopEarners({ end_date: new Date() })) as any[];
        const res2 = (await getTopEarners({ end_date: sevenDaysAgo })) as any[];
        console.log(res)
        console.log(res2)
        setTopDevs(res);

        const oneWeekAgoRankDict: { [key: string]: number } = {};

        res2.forEach((user, index) => {
          oneWeekAgoRankDict[user.name] = index;
        });

        
        const rankChangesDict: { [key: string]: "up" | "down" | "same" } = {};

        res.forEach((user, index) => {
          const oneWeekAgoRank = oneWeekAgoRankDict[user.name];

          if (oneWeekAgoRank !== undefined) {
            const rankChange = oneWeekAgoRank - index;

            if (rankChange > 0) {
              rankChangesDict[user.name] = "up";
            } else if (rankChange < 0) {
              rankChangesDict[user.name] = "down";
            } else {
              rankChangesDict[user.name] = "same";
            }
          } else {
            // User was not found in the oneWeekAgoData, consider them added
            rankChangesDict[user.name] = "up";
          }

          return user;
        });


        setChanges(rankChangesDict)


      }
      else {
        const res = (await getTopEarnersLang({ language: selectedLanguage })) as any[];
        const res2 = (await getTopEarnersLang({ language: selectedLanguage, end_date: sevenDaysAgo })) as any[];

        const oneWeekAgoRankDict: { [key: string]: number } = {};

        res2.forEach((user, index) => {
          oneWeekAgoRankDict[user.name] = index;
        });

        // Initialize an empty dictionary (object) to store rank changes
        const rankChangesDict: { [key: string]: "up" | "down" | "same" } = {};

        res.forEach((user, index) => {
          const oneWeekAgoRank = oneWeekAgoRankDict[user.name];

          if (oneWeekAgoRank !== undefined) {
            const rankChange = oneWeekAgoRank - index;

            if (rankChange > 0) {
              rankChangesDict[user.name] = "up";
            } else if (rankChange < 0) {
              rankChangesDict[user.name] = "down";
            } else {
              rankChangesDict[user.name] = "same";
            }
          } else {
            // User was not found in the oneWeekAgoData, consider them added
            rankChangesDict[user.name] = "up";
          }

          return user;
        });


        setChanges(rankChangesDict)

        setTopDevs(res);
      }
    };

    fetchData();
  }, [selectedLanguage]);
  return (
    <div className="w-full flex flex-col items-center justify-center mt-10 gap-2.5 py-24">
      <LeaderBoardSelector />
      <div className="w-full max-w-[1200px] mx-auto flex items-start gap-2.5">

        <div className="p-4 bg-gray-200 rounded-md w-fit">
          <h2 className="text-lg font-bold mb-2">
            Filter by Programming Language
          </h2>
          <ul className="space-y-2">
            {languages.map((language) => (
              <li
                key={language}
                onClick={() => setSelectedLanguage(language)}
                className={`cursor-pointer ${selectedLanguage === language
                  ? "text-blue-600"
                  : "text-gray-800"
                  }`}
              >
                {language}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-100 w-[70%] flex flex-col px-5 py-2.5 items-center justify-center">

          <h1 className="mb-2.5">Top Earners</h1>
          <div className="w-full flex justify-between border-b border-gray-300">
            <p className="font-bold text-lg">User</p>
            <p className="font-bold text-lg">Total Earned</p>
          </div>
          {topDevs &&
            topDevs.map((dev, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-300 w-full"
              >
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => router.push(`/account/${dev.id}`)}
                    className="text-lg"
                  >
                    {index + 1}. {dev.name}
                  </button>
                  {changes && changes[dev.name] == "up" ? (
                    <ArrowUp color="green" />
                  ) : changes && changes[dev.name] == "down" ? (
                    <ArrowDown color="red" />
                  ) : (
                    <span>—</span>
                  )}
                </div>
                <p className="text-lg">${dev.total_earned}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
