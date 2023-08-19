import { useRef, useState } from "react";
import Image from "next/image";
import { useOutsideAlerter } from "@/src/hooks";
import { Industry } from "@/types";

interface Props {
  options: Industry[];
  selected: Industry | null;
  onChange: (selected: Industry) => void;
}

const IndustryDropdown: React.FC<Props> = ({ options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef(null);
  useOutsideAlerter(menuRef, () => {
    setIsOpen(false);
  });

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleOptionClick = (option: Industry) => {
    onChange(option);
    setIsOpen(false); // close IndustryDropdown after selecting an option
  };

  const renderOptions = () => {
    return options.map((option) => (
      <div
        key={option.name}
        className="bg-neutralBtn w-full flex items-center py-2 px-4 text-xl cursor-pointer"
        onClick={() => handleOptionClick(option)}
      >
        <div className="flex items-center gap-2">
          {option && !!option.icon && (
            <Image
              src={option.icon}
              width={20}
              height={20}
              alt={option.name ?? "mint logo"}
            />
          )}
          {option.name}
        </div>
      </div>
    ));
  };

  return (
    <div className="relative w-full h-[50px]" ref={menuRef}>
      <div
        className="h-full flex bg-neutralBtn border border-neutralBtnBorder 
        items-center cursor-pointer px-4 rounded-lg"
        onClick={toggleOpen}
      >
        <div className="flex items-center gap-2">
          {selected && (
            <Image
              src={selected.icon}
              width={20}
              height={20}
              alt={selected.name}
            />
          )}
          <div className="overflow-hidden whitespace-nowrap overflow-ellipsis">
            {selected ? selected.name : "Industry"}
          </div>
        </div>
        <div
          className={`absolute right-4 text-2xl ${
            isOpen ? "transform rotate-180" : ""
          }`}
        >
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

export default IndustryDropdown;
