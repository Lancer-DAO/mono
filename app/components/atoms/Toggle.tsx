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
    <div className="toggle-button flex items-center gap-2">
      <p className="text-neutral500 whitespace-nowrap text-sm">
        {toggleConfig.selected === "option1" ? "All Quests" : "My Quests"}
      </p>
      <input
        type="checkbox"
        id="toggle"
        checked={toggleConfig.selected === "option2"}
        onChange={() => {
          handleClick(
            toggleConfig.selected === "option1" ? "option2" : "option1"
          );
        }}
      />
      <label htmlFor="toggle"></label>
    </div>
  );
};

export default Toggle;
