import { FC, useEffect, useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import { LeaderBoardSelector } from "./components";

const languages = ["All", "JavaScript", "Python", "Java", "Cpp", "Ruby"];

export const LeaderboardCommits: FC<any> = ({ self }) => {
  const [topDevs, setTopDevs] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [change, setChange] = useState<any>({});
  const [dateValue, setDateValue] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const handleValueChange = (newValue) => {
    console.log("newValue:", newValue);
    setDateValue(newValue);
  };

  useEffect(() => {
    const fetchData = async () => {
      const sDate = new Date(dateValue.startDate);
      const eDate = new Date(dateValue.endDate);
      // @ts-ignore
      const diffTime = Math.abs(eDate - sDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const formattedDate = new Date(
        new Date().setDate(new Date().getDate() - 7)
      )
        .toISOString()
        .split("T")[0];
      const res = await fetch(
        `https://lancer.up.railway.app/ranking/top_devs/commits?start_date=${dateValue.startDate}&till=${diffDays}&limit=10`
      );
      const data = await res.json();
      console.log(data);
      setTopDevs(data);
    };
    fetchData();
  }, [selectedLanguage, dateValue]);

  return (
    <div className="flex flex-col items-center justify-center gap-2.5 py-24">
      <LeaderBoardSelector />
      <div className="bg-gray-100 w-[70%] flex flex-col px-5 py-2.5 items-center justify-center">
        <h1 className="text-3xl font-semibold mb-4 w-full">
          Top Developers By Commits
        </h1>

        {/* <h3>Select Date Range</h3>
          <Datepicker
            minDate={new Date("2023-08-02")}
            maxDate={new Date()}
            separator="to"
            inputClassName="bg-gray-200 w-full h-10 text-xl mb-2"
            primaryColor="green"
            value={dateValue}
            onChange={handleValueChange}
          /> */}

        <div className="w-full flex justify-between border-b border-gray-300">
          <p className="font-bold text-xl">Github Username</p>
          <p className="font-bold text-xl">Total Commits</p>
        </div>
        {topDevs &&
          topDevs.map((dev, index) => (
            <div
              key={dev.index}
              className="flex items-center justify-between py-2 border-b border-gray-300 w-[100%]"
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
                {/* {change[dev.name] == "up" ? <ArrowUp color="green"/>
                : change[dev.name] == "down" ? <ArrowDown color="red" /> : <span>—</span>} */}
              </div>
              <p className="text-xl">{dev.total_commits}</p>
            </div>
          ))}
      </div>
    </div>
  );
};
