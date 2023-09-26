import { Industry } from "@prisma/client";
import { FC } from "react";

interface Props {
  options: Industry[];
  selected: Industry | null;
  onChange: (selected: Industry) => void;
}

const IndustryOptions: FC<Props> = ({ options, selected, onChange }) => {
  return (
    options && (
      <div className="flex items-center gap-3">
        {options.map((option) => (
          <div
            key={option.name}
            className="flex items-center cursor-pointer text-sm"
            onClick={() => onChange(option)}
          >
            <div
              className={`flex items-center justify-center w-5 h-5 mr-2 border rounded-full bg-white
            `}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  selected.id === option.id ? "bg-primary200" : "bg-white"
                }`}
              />
            </div>
            {option.name}
          </div>
        ))}
      </div>
    )
  );
};

export default IndustryOptions;
