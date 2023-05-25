import { useState } from "react";

interface Props {
  options: Option[];
  selected: Option[];
  onChange: (selected: Option[]) => void;
}

interface Option {
  label: string;
  value: string;
}

const Dropdown: React.FC<Props> = ({ options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

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
        
        <label key={option.value} className="flex items-center px-[10px] py-[5px] text-[14px] text-555 cursor-pointer hover:bg-f5f5f5">
          <input
            type="checkbox"
            value={option.value}
            checked={isChecked ? true : false}
            onChange={() => handleCheckboxChange(option)}
            className="mr-[20px]"
          />
          {option.label}
        </label>
      );
    });
  };


  return (
    <div className="relative inline-block mr-[10px] w-[200px]">
      <div className="flex justify-between items-center p-[10px] bg-white rounded-[5px] cursor-pointer shadow-[0 6px 12px 0 rgba(21, 60, 245, 0.05), 0 2px 6px 0 rgba(5, 21, 46, 0.02), 0 -2px 6px 0 rgba(36, 52, 128, 0.03)] transition-shadow duration-[400ms] ease-in-out" onClick={toggleOpen}>
        <div className="text-[14px] text-555 overflow-hidden whitespace-nowrap overflow-ellipsis">
          {selected.length === 0
            ? "Select"
            : selected.map((item) => item.label).join(", ")}
        </div>
        <div className={`text-[14px] text-555 ${isOpen ? "transform rotate-180" : ""}`}>▾</div>
      </div>
      {isOpen && (
        <div
          className="absolute top-full left-0 z-1 flex flex-col max-h-[200px] overflow-y-auto bg-fff border border-ccc rounded-[5px] shadow-md w-full"
          onMouseLeave={() => setIsOpen(false)}
        >
          {renderOptions()}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
