/* eslint-disable @next/next/no-html-link-for-pages */
import { Dispatch, SetStateAction } from "react";
import { MultiSelectDropdown } from "@/components";
import { BOUNTY_STATES } from "@/types";
import { capitalize } from "lodash";
import { Filters } from "@/types";
import { useUserWallet } from "@/src/providers";

interface QuestFiltersProps {
  tags: string[];
  // orgs: string[];
  industries: string[];
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  count: number;
}

export const QuestFilters = ({
  tags,
  // orgs,
  filters,
  industries,
  setFilters,
  count,
}: QuestFiltersProps) => {
  const { currentUser } = useUserWallet();

  return (
    <div className="bg-secondary300 flex rounded-t-md items-center justify-between px-6 py-4 h-[75px]">
      <div>
        <h1 className="text-white text-xl font-bold">All Quests</h1>
        <p className="text-white opacity-[60%]">Showing {count} Quests</p>
      </div>

      <div className="flex gap-3">
        {/* industries */}
        <MultiSelectDropdown
          extraClasses="w-[140px]"
          options={industries.map((industry) => {
            return {
              value: industry,
              label: capitalize(industry),
            };
          })}
          selected={filters.industries.map((industry) => {
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
        {/* tags */}
        <MultiSelectDropdown
          extraClasses="w-[160px]"
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
        {/* states */}
        <MultiSelectDropdown
          extraClasses="w-[140px]"
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

        <button
          disabled={!currentUser || !currentUser.hasBeenApproved}
          onClick={() => (window.location.href = "/create")}
          className="disabled:opacity-60 bg-primary200 py-2 px-4 text-white text-sm title-text rounded-md"
        >
          Create Quest
        </button>
      </div>
    </div>
  );
};
