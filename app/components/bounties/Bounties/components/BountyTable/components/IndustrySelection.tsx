import { FC } from "react";
import Image from "next/image";
import { Filters, Industry } from "@/types";

interface Props {
  industries: Industry[];
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

const IndustrySelection: FC<Props> = ({ industries, filters, setFilters }) => {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-bold">Industry</p>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 items-start">
          {industries?.map((industry) => {
            return (
              <div
                key={industry.id}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  setFilters({
                    ...filters,
                    industries: filters.industries?.includes(industry.name)
                      ? filters.industries?.filter(
                          (name) => name !== industry.name
                        )
                      : [...filters.industries, industry.name],
                  });
                }}
              >
                <input
                  type="radio"
                  id={industry.name}
                  name={industry.name}
                  checked={filters.industries?.includes(industry.name)}
                />
                <div className="flex items-center gap-1">
                  <Image
                    src={industry.icon}
                    width={20}
                    height={20}
                    alt={industry.name}
                  />
                  <p>{industry.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IndustrySelection;
