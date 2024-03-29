import { Industry } from "@prisma/client";
import React, { useState } from "react";

export interface Option {
  name: string;
  value: string;
}

interface Props {
  options: Option[];
  selected: Option | null;
  onChange: (selected: Option) => void;
}

const IndustryOptions: React.FC<Props> = ({ options, selected, onChange }) => {
  return (
    options && (
      <div className="flex ">
        {options.map((option) => (
          <div
            key={option.name}
            className="flex items-center cursor-pointer mb-2 mr-6 text-sm"
            onClick={() => onChange(option)}
          >
            <div
              className={`flex items-center justify-center w-5 h-5 mr-2 border rounded-full bg-white
            `}
            >
              <div
                className={`w-2.5 h-2.5  rounded-full ${
                  selected.value === option.value ? "bg-primary200" : "bg-white"
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
