import { api } from "@/src/utils";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { LeaderBoardSelector } from "./components";

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

  useEffect(() => {
    const fetchData = async () => {

      if (!selectedLanguage || selectedLanguage == "All") {
        const res = (await getTopEarners()) as any[];
        setTopDevs(res);
      }
      else {
        const res = (await getTopEarnersLang({ language: selectedLanguage })) as any[];
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
                </div>
                <p className="text-lg">${dev.total_earned}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
