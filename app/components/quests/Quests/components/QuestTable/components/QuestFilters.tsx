/* eslint-disable @next/next/no-html-link-for-pages */
import { Dispatch, SetStateAction, useEffect } from "react";
import { RangeSlider, MultiSelectDropdown } from "@/components";
import { BOUNTY_STATES } from "@/types";
import { capitalize } from "lodash";
import { Filters, Industry, IAsyncResult } from "@/types";
import { motion } from "framer-motion";
import IndustrySelection from "./IndustrySelection";
import { Mint } from "@prisma/client";
import { useUserWallet } from "@/src/providers";

interface QuestFiltersProps {
  mints: Mint[];
  industries: Industry[];
  tags: string[];
  // orgs: string[];
  priceBounds: [number, number];
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  count: number;
}

export const QuestFilters = ({
  mints,
  industries,
  tags,
  // orgs,
  priceBounds,
  filters,
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
        <MultiSelectDropdown
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
        <MultiSelectDropdown
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
