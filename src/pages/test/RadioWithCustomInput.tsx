import { useState } from "react";

type Props = {
  options: string[];
  defaultOption: string;
};

const RadioWithCustomInput = ({ options, defaultOption }: Props) => {
  const [selectedOption, setSelectedOption] = useState(defaultOption);
  const [customInputValue, setCustomInputValue] = useState("");

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };

  const handleCustomInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomInputValue(event.target.value);
  };

  const showCustomInput = selectedOption === "Other";

  return (
    <div className="radio-container">
      <div className="radio-options">
        {options.map((option) => (
          <label key={option} className="form-radio-option">
            <input
              type="radio"
              name="option"
              className="form-radio-option-input"
              value={option}
              checked={selectedOption === option}
              onChange={handleOptionChange}
            />
            {option}
          </label>
        ))}
      </div>
      {showCustomInput && (
        <div className="form-cell">
          <label className="form-radio-option-other">Mint Address</label>

          <input
            type="text"
            name="customOption"
            className="form-radio-option-other-input"
            value={customInputValue}
            onChange={handleCustomInputChange}
          />
        </div>
      )}
    </div>
  );
};

export default RadioWithCustomInput;
