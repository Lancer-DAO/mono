import { useOutsideAlerter } from "@/src/hooks";
import Image from "next/image";
import { useRef, useState } from "react";
import { MarketingIcon } from "@/components";

interface Props {
  options: Option[];
  selected: Option[];
  onChange: (selected: Option[]) => void;
}

interface Option {
  label: string;
  value: string;
  icon?: string;
}

const Dropdown: React.FC<Props> = ({ options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef(null);
  useOutsideAlerter(menuRef, () => {
    setIsOpen(false);
  });

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleCheckboxChange = (option: Option) => {
    const alreadySelected = selected.find(
      (item) => item.value === option.value
    );

    if (alreadySelected) {
      const filteredSelection = selected.filter(
        (item) => item.value !== option.value
      );
      onChange(filteredSelection);
    } else {
      const updatedSelection = [...selected, option];
      onChange(updatedSelection);
    }
  };

  const renderOptions = () => {
    return options.map((option) => {
      const isChecked = selected.find((item) => item.value === option.value);
      return (
        <label
          key={option.value}
          className="bg-neutralBtn w-full flex items-center py-2 px-4 text-xl cursor-pointer"
        >
          <input
            type="checkbox"
            value={option.value}
            checked={isChecked ? true : false}
            onChange={() => handleCheckboxChange(option)}
            className="mr-[10px]"
          />
          <div className="flex items-center gap-2">
            <MarketingIcon height={20} width={20} />
            {option.label}
          </div>
        </label>
      );
    });
  };

  return (
    <div className="relative w-[220px] h-[50px]" ref={menuRef}>
      <div
        className="h-full flex justify-between bg-neutralBtn border border-neutralBtnBorder 
        items-center cursor-pointer px-4 rounded-lg"
        onClick={toggleOpen}
      >
        <div className="text-xl font-bold overflow-hidden whitespace-nowrap overflow-ellipsis">
          {selected.length === 0
            ? "Select"
            : selected.map((item) => item.label).join(", ")}
        </div>
        <div className={`text-xl ${isOpen ? "transform rotate-180" : ""}`}>
          ▾
        </div>
      </div>
      {isOpen && (
        <div
          className="absolute top-full left-0 z-10 flex flex-col max-h-[200px] overflow-y-auto 
          bg-neutralBtn border border-neutralBtnBorder rounded-lg shadow-md w-full"
        >
          {renderOptions()}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
