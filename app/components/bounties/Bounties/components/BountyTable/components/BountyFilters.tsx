import { Dispatch, SetStateAction } from "react";
import { MultiSelectDropdown } from "@/components/molecules";
import { BOUNTY_STATES } from "@/types";
import { capitalize } from "lodash";
import { Filters, Industry, IAsyncResult } from "@/types";
import { motion } from "framer-motion";
import IndustrySelection from "./IndustrySelection";
import { Mint } from "@prisma/client";

interface BountyFiltersProps {
  mints: Mint[];
  industries: Industry[];
  tags: string[];
  // orgs: string[];
  priceBounds: [number, number];
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  setBounties: (bounties: IAsyncResult<any[]>) => void;
}

export const BountyFilters = ({
  mints,
  industries,
  tags,
  // orgs,
  priceBounds,
  filters,
  setFilters,
  setBounties,
}: BountyFiltersProps) => {
  return (
    <motion.form
      className="flex flex-col items-start gap-6 pl-10 mt-16 sticky top-24"
      initial={{ opacity: 0, x: -200 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -200 }}
      key={`filters`}
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="w-6 h-6 accent-primaryBtn border border-primaryBtnBorder
          rounded-xl focus:ring-industryGreenBorder focus:border-green-500"
          checked={filters.isMyBounties}
          onChange={() => {
            setBounties({ result: [] });
            setFilters({
              ...filters,
              isMyBounties: !filters.isMyBounties,
            });
          }}
        />
        <p className="font-bold">Only My Bounties</p>
      </div>
      {/* {!!filters?.estimatedPriceBounds && (
        <div className="w-full flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <p className="font-bold">Price Range:</p>
            <p className="text-sm">{`$${filters.estimatedPriceBounds?.[0]} - $${filters.estimatedPriceBounds?.[1]}`}</p>
          </div>

          <RangeSlider
            bounds={priceBounds}
            setBounds={(bounds) => {
              setFilters({ ...filters, estimatedPriceBounds: bounds });
            }}
          />
        </div>
      )} */}

      <IndustrySelection
        industries={industries}
        filters={filters}
        setFilters={setFilters}
      />
      {/* <div className="flex flex-col gap-3">
        <p className="font-bold">Creators</p>
        <MultiSelectDropdown
          options={orgs.map((org) => {
            return {
              value: org,
              label: org,
            };
          })}
          selected={filters.orgs.map((org) => {
            return {
              value: org,
              label: org,
            };
          })}
          onChange={(options) => {
            setFilters({
              ...filters,
              orgs: options.map((option) => option.value),
            });
          }}
        />
      </div> */}
      {/* <div className="flex flex-col gap-3">
        <p className="font-bold">Tags</p>
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
              tags: options.map((option) => option.value),
            });
          }}
        />
      </div> */}
      <div className="flex flex-col gap-3">
        <p className="font-bold">Status</p>
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
      </div>
    </motion.form>
  );
};
