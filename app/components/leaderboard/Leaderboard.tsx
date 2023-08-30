import { FC, useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "react-feather";

const languages = ['All', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Python', 'Ruby', 'Golang', 'Java', 'Rust', 'Solidity', 'Csharp', 'C', 'Cpp', 'JSON']

const fetchDataForLanguage = async (language, formattedDate, formattedDate2) => {
  const url = `https://lancer.up.railway.app/ranking/top_devs/language?language=${language.toLowerCase()}&start_date=${formattedDate}&till=7&limit=10`;
  const res = await fetch(url);
  const data = await res.json();

  const url2 = `https://lancer.up.railway.app/ranking/top_devs/language?language=${language.toLowerCase()}&start_date=${formattedDate2}&till=7&limit=10`;
  const res2 = await fetch(url2);
  const oldData = await res2.json();

  const result = Object.fromEntries(data.map(newEntry => {
    const oldEntry = oldData.find(o => o.github_name === newEntry.github_name);
    const newRank = newEntry.rank;
    const oldRank = oldEntry ? oldEntry.rank : Infinity;

    console.log(oldRank, newRank, newEntry.github_name);

    if (newRank < oldRank) {
      return [newEntry.github_name, "up"];
    } else if (newRank > oldRank) {
      return [newEntry.github_name, "down"];
    } else {
      return [newEntry.github_name, "no_change"];
    }
  }));
  return { data, result };
};

export const Leaderboard: FC<any> = ({ self }) => {
  const [topDevs, setTopDevs] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [change, setChange] = useState<any>({});

  const handleLanguageClick = (language) => {
    setSelectedLanguage(language);
  };

  useEffect(() => {
    const fetchData = async () => {
      const formattedDate = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];
      const formattedDate2 = new Date(new Date().setDate(new Date().getDate() - 8)).toISOString().split('T')[0];

      if (selectedLanguage && selectedLanguage !== "All") {
        const { data, result } = await fetchDataForLanguage(selectedLanguage, formattedDate, formattedDate2);
        setChange(result);
        setTopDevs(data);
      } else {
        const res = await fetch(`https://lancer.up.railway.app/ranking/top_devs/all_languages?start_date=${formattedDate}&till=7&limit=10`);
        const dataJson = await res.json();
        setTopDevs(dataJson);
      }
    };

    fetchData();
  }, [selectedLanguage]);

  return (
    <div className="flex align-center justify-center mt-10 gap-[10px]">
      <div className="p-4 bg-gray-200 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Filter by Programming Language</h2>
        <ul className="space-y-2">
          {languages.map((language) => (
            <li
              key={language}
              onClick={() => handleLanguageClick(language)}
              className={`cursor-pointer ${selectedLanguage === language ? 'text-blue-600' : 'text-gray-800'
                }`}
            >
              {language}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-gray-100 w-[70%] flex flex-col px-[20px] py-[10px] align-center justify-center">
        <h1 className="text-3xl font-semibold mb-4 w-full">Top Developers In The Last Week</h1>
        <div className="w-full flex justify-between w-[100%] border-b border-gray-300">
          <p className="font-bold text-xl">Github Username</p>
          <p className="font-bold text-xl">Total Lines Contributed</p>
        </div>
        {topDevs && topDevs.map((dev, index) => (
          <div key={dev.index} className="flex items-center justify-between py-2 border-b border-gray-300 w-[100%]">

            <div className="flex gap-2 align-center">
              <a target="_blank" href={`https://github.com/${dev.github_name}`}><p className="text-xl">{index + 1}. {dev.github_name}</p></a>
              {change[dev.github_name] == "up" ? <ArrowUp color="green" />
                : change[dev.github_name] == "down" ? <ArrowDown color="red" /> : <span>—</span>}
            </div>
            <p className="text-xl">{dev.lines_contributed}</p>
          </div>
        ))}
        <a href="/leaderboard/commits">View commits Leaderboard</a>
      </div>
    </div>
  )
};

