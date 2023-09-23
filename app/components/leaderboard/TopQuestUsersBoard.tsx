import { api } from "@/src/utils";
import { FC, useEffect, useState } from "react";
import { LeaderBoardSelector } from "./components";
import { useRouter } from "next/router";

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


export const TopQuestUsersBoard: FC<any> = () => {
  const [topDevs, setTopDevs] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState<any>()
  const { mutateAsync: getTopQuestUsers } =
    api.leaderboard.getTopQuestUsers.useMutation();

  const { mutateAsync: getTopQuestUsersLang } =
    api.leaderboard.getTopQuestUsersLang.useMutation();


  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {

      if (!selectedLanguage || selectedLanguage == "All") {
        const res = (await getTopQuestUsers()) as any[];
        const formattedResults = res.map((result) => ({
          id: result.id,
          name: result.name,
          total_bounties: Number(result.total_bounties), // BigInt to number
        }));
        setTopDevs(formattedResults);
      }
      else {
        const res = (await getTopQuestUsersLang({ language: selectedLanguage })) as any[];
        const formattedResults = res.map((result) => ({
          id: result.id,
          name: result.name,
          total_bounties: Number(result.total_bounties), // BigInt to number
        }));
        setTopDevs(formattedResults);
      }
    };

    fetchData();
  }, [selectedLanguage]);

  return (
    <div className="w-full flex flex-col items-center justify-start mt-10 gap-2.5 py-24">
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


          <h1 className="mb-2.5">Top Lancers By Quests Finished</h1>
          <div className="w-full flex justify-between border-b border-gray-300">
            <p className="font-bold text-lg">User</p>
            <p className="font-bold text-lg">Total Quests</p>
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
                </div>
                <p className="text-lg">{dev.total_bounties}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
