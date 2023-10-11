import { FC, useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "react-feather";
import { LeaderBoardSelector } from "./components";

// These are all supported programming languages right now that are being parsed from GitHub
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

const fetchDataForLanguage = async (
  language,
  formattedDate,
  formattedDate2
) => {
  const makeUrl = (date) =>
    `https://lancer.up.railway.app/ranking/top_devs/language?language=${language.toLowerCase()}&start_date=${date}&till=7&limit=10`;

  const [res, res2] = await Promise.all([
    fetch(makeUrl(formattedDate)),
    fetch(makeUrl(formattedDate2)),
  ]);
  const [data, oldData] = await Promise.all([res.json(), res2.json()]);

  const result = Object.fromEntries(
    data.map((newEntry) => {
      const oldEntry = oldData.find(
        (o) => o.github_name === newEntry.github_name
      );
      const [oldRank, newRank] = [oldEntry?.rank || Infinity, newEntry.rank];

      if (newRank < oldRank) return [newEntry.github_name, "up"];
      if (newRank > oldRank) return [newEntry.github_name, "down"];
      return [newEntry.github_name, "no_change"];
    })
  );
  return { data, result };
};

export const ContributionBoard: FC<any> = () => {
  const [topDevs, setTopDevs] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [change, setChange] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      const getDate = (offset) =>
        new Date(new Date().setDate(new Date().getDate() - offset))
          .toISOString()
          .split("T")[0];
      const formattedDate = getDate(7);
      const formattedDate2 = getDate(8);

      if (selectedLanguage && selectedLanguage !== "All") {
        const { data, result } = await fetchDataForLanguage(
          selectedLanguage,
          formattedDate,
          formattedDate2
        );
        setChange(result);
        setTopDevs(data);
      } else {
        const res = await fetch(
          `https://lancer.up.railway.app/ranking/top_devs/all_languages?start_date=${formattedDate}&till=7&limit=10`
        );
        const dataJson = await res.json();
        setTopDevs(dataJson);
      }
    };

    fetchData();
  }, [selectedLanguage]);

  return (
    <div className="w-full flex flex-col items-center justify-center gap-2.5 py-24">
      <LeaderBoardSelector />
      <div className="w-full max-w-[1200px] mx-auto flex items-start gap-2.5">
        <div className="p-4 bg-white rounded-md w-fit">
          <h2 className="text-lg font-bold mb-2">
            Filter by Programming Language
          </h2>
          <ul className="space-y-2">
            {languages.map((language) => (
              <li
                key={language}
                onClick={() => setSelectedLanguage(language)}
                className={`cursor-pointer ${
                  selectedLanguage === language
                    ? "text-blue-600"
                    : "text-gray-800"
                }`}
              >
                {language}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-md w-full flex flex-col px-[20px] py-2.5 items-center justify-center">
          <h1 className="text-2xl font-bold mb-4 w-full">Top Developers</h1>
          <div className="w-full flex justify-between border-b border-gray-300">
            <p className="font-bold text-xl">Github Username</p>
            <p className="font-bold text-xl">Total Lines Contributed</p>
          </div>
          {topDevs &&
            topDevs.map((dev, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-300 w-full"
              >
                <div className="flex gap-2 items-center">
                  <a
                    target="_blank"
                    href={`https://github.com/${dev.github_name}`}
                    rel="noreferrer"
                  >
                    <p className="text-xl">
                      {index + 1}. {dev.github_name}
                    </p>
                  </a>
                  {change[dev.github_name] == "up" ? (
                    <ArrowUp color="#6BB274" />
                  ) : change[dev.github_name] == "down" ? (
                    <ArrowDown color="#F5364F" />
                  ) : (
                    <span>—</span>
                  )}
                </div>
                <p className="text-xl">{dev.lines_contributed}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
