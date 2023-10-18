/* eslint-disable @next/next/no-html-link-for-pages */
import { Dispatch, SetStateAction, use, useEffect, useState } from "react";
import { MultiSelectDropdown, Toggle } from "@/components";
import { BOUNTY_STATES } from "@/types";
import { capitalize } from "lodash";
import { Filters } from "@/types";
import { ToggleConfig } from "@/components/atoms/Toggle";

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
  const [toggleConfig, setToggleConfig] = useState<ToggleConfig>({
    option1: {
      title: "All Quests",
    },
    option2: {
      title: "My Quests",
    },
    selected: "option1",
  });

  useEffect(() => {
    if (toggleConfig.selected === "option1") {
      setFilters({ ...filters, myQuests: false });
    } else {
      setFilters({ ...filters, myQuests: true });
    }
  }, [toggleConfig]);

  return (
    <div className="flex items-center justify-between px-8 pt-3">
      <Toggle toggleConfig={toggleConfig} setToggleConfig={setToggleConfig} />
      <div className="w-full flex items-center justify-end gap-3 ">
        <MultiSelectDropdown
          extraClasses="w-[140px]"
          version="white"
          title="Industries"
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
        {/* <MultiSelectDropdown
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
        /> */}
      </div>
    </div>
  );
};
