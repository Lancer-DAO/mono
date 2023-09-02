import { useRef, useState } from "react";
import Image from "next/image";
import { useOutsideAlerter } from "@/src/hooks";
import * as Prisma from "@prisma/client";

interface Props {
  options: Prisma.Mint[];
  selected: Prisma.Mint | null;
  onChange: (selected: Prisma.Mint) => void;
}

const MintsDropdown: React.FC<Props> = ({ options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef(null);
  useOutsideAlerter(menuRef, () => {
    setIsOpen(false);
  });

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleOptionClick = (option: Prisma.Mint) => {
    onChange(option);
    setIsOpen(false); // close MintsDropdown after selecting an option
  };

  const renderOptions = () => {
    return options.map((option) => (
      <div
        key={option.name}
        className="bg-neutralBtn w-full flex items-center py-2 px-4 text-xl cursor-pointer"
        onClick={() => handleOptionClick(option)}
      >
        <div className="flex items-center gap-2">
          {option && !!option.logo && (
            <Image
              src={option.logo}
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
    <>
      <p className="w-full leading-3 -mb-2">Token</p>
      <div className="relative w-full h-[50px]" ref={menuRef}>
        <div
          className="h-full flex justify-center bg-neutralBtn border border-neutralBtnBorder 
          items-center cursor-pointer px-4 rounded-lg"
          onClick={toggleOpen}
        >
          <div className="flex items-center gap-2">
            {selected && (
              <Image
                src={selected?.logo}
                width={20}
                height={20}
                alt={selected?.name}
              />
            )}
            <div className="text-center overflow-hidden whitespace-nowrap overflow-ellipsis">
              {selected ? selected.ticker : "Select"}
            </div>
          </div>
          <div
            className={`absolute right-2 text-xl ${
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
    </>
  );
};

export default MintsDropdown;
