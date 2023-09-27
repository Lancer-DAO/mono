import { useOutsideAlerter } from "@/src/hooks";
import Image from "next/image";
import { useRef, useState } from "react";
import { Option } from "@/types";

interface Props {
  options: Option[];
  selected: Option[];
  onChange: (selected: Option[]) => void;
  version?: "default" | "white";
}

const MultiSelectDropdown: React.FC<Props> = ({
  options,
  selected,
  onChange,
  version,
}) => {
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
          <div className="flex items-center gap-2 text-sm">
            {option.icon && (
              <Image
                src={option?.icon}
                height={20}
                width={20}
                alt={option?.label ?? "icon"}
              />
            )}
            {option.label}
          </div>
        </label>
      );
    });
  };
  console.log("version", version);

  if (version === "white") {
    return (
      <div className="relative w-full h-[34px]" ref={menuRef}>
        <div
          className="h-full w-full flex justify-between bg-transparent border border-neutral-200 text-neutral500 
        items-center cursor-pointer px-4 rounded-lg"
          onClick={toggleOpen}
        >
          <div className="text-[14px] text-neutral-500 overflow-hidden whitespace-nowrap overflow-ellipsis">
            {selected?.length === 0
              ? "Select"
              : selected?.map((item) => item.label).join(", ")}
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
  }

  return (
    <div className="relative max-w-[220px] h-[40px]" ref={menuRef}>
      <div
        className="h-full flex justify-between bg-transparent border border-[#6B7699] text-white 
        items-center cursor-pointer px-4 rounded-lg"
        onClick={toggleOpen}
      >
        <div className="text-[14px] text-white overflow-hidden whitespace-nowrap overflow-ellipsis">
          {selected?.length === 0
            ? "Select"
            : selected?.map((item) => item.label).join(", ")}
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

export default MultiSelectDropdown;
