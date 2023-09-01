import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";

export type ToggleConfig = {
  option1: {
    title: string;
    icon?: string;
  };
  option2: {
    title: string;
    icon?: string;
  };
  selected: "option1" | "option2";
};

interface Props {
  toggleConfig: ToggleConfig;
  setToggleConfig: Dispatch<SetStateAction<ToggleConfig>>;
}

const Toggle: FC<Props> = ({ toggleConfig, setToggleConfig }) => {
  const handleClick = (tab: "option1" | "option2") => {
    let newToggleConfig = { ...toggleConfig };
    if (toggleConfig.selected !== tab) {
      newToggleConfig.selected = tab;
    }
    setToggleConfig(newToggleConfig);
  };

  return (
    <div
      className={`w-[255px] h-[50px] bg-neutralBtn flex items-center justify-between px-[2.5px] rounded-lg`}
    >
      <div
        className={`${
          toggleConfig.selected === "option1"
            ? "bg-primaryBtn font-bold text-textGreen"
            : "bg-neutralBtn text-textPrimary font-base"
        } w-[120px] h-[45px] flex flex-col items-center justify-center hover:cursor-pointer rounded-lg text-sm`}
        onClick={() => handleClick("option1")}
      >
        {toggleConfig.option1.title.toUpperCase()}
      </div>
      <div
        className={`${
          toggleConfig.selected === "option2"
            ? "bg-primaryBtn font-bold text-textGreen"
            : "bg-neutralBtn text-textPrimary font-base"
        } w-[120px] h-[45px] flex flex-col items-center justify-center hover:cursor-pointer rounded-lg text-sm`}
        onClick={() => handleClick("option2")}
      >
        {toggleConfig.option2.title.toUpperCase()}
      </div>
    </div>
  );
};

export default Toggle;
