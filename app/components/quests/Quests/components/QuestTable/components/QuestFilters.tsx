/* eslint-disable @next/next/no-html-link-for-pages */
import { Dispatch, SetStateAction } from "react";
import { MultiSelectDropdown } from "@/components";
import { BOUNTY_STATES } from "@/types";
import { capitalize } from "lodash";
import { Filters } from "@/types";

interface QuestFiltersProps {
  tags: string[];
  industries: string[];
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
}

export const QuestFilters = ({
  tags,
  filters,
  industries,
  setFilters,
}: QuestFiltersProps) => {
  return (
    <div className="w-full flex items-center justify-end gap-3 px-5 pt-5">
      <MultiSelectDropdown
        extraClasses="w-[140px]"
        version="white"
        title="Specializations"
        options={industries.map((industry) => {
          return {
            value: industry,
            label: capitalize(industry),
          };
        })}
        selected={filters.industries?.map((industry) => {
          return {
            value: industry,
            label: capitalize(industry),
          };
        })}
        onChange={(options) => {
          setFilters({
            ...filters,
            industries: options.map((option) => option.value as string),
          });
        }}
      />
      {tags.length > 0 && (
        <MultiSelectDropdown
          extraClasses="w-[160px]"
          version="white"
          title="Tags"
          options={tags.map((tag) => {
            return {
              value: tag,
              label: capitalize(tag),
            };
          })}
          selected={filters.tags.map((tag) => {
            return {
              value: tag,
              label: capitalize(tag),
            };
          })}
          onChange={(options) => {
            setFilters({
              ...filters,
              tags: options.map((option) => option.value as string),
            });
          }}
        />
      )}
      <MultiSelectDropdown
        extraClasses="w-[140px]"
        version="white"
        title="States"
        options={BOUNTY_STATES.map((state) => {
          return {
            value: state,
            label: state
              .split("_")
              .map((_state) => capitalize(_state))
              .join(" "),
          };
        })}
        selected={filters.states.map((state) => {
          return {
            value: state,
            label: state
              .split("_")
              .map((_state) => capitalize(_state))
              .join(" "),
          };
        })}
        onChange={(options) => {
          setFilters({
            ...filters,
            states: options.map((option) => option.value) as string[],
          });
        }}
      />
    </div>
  );
};
