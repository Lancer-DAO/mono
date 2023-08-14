import MultiSelectDropdown from "@/components/molecules/MultiSelectDropdown";
import RangeSlider from "@/components/molecules/RangeSlider";
import { BOUNTY_STATES } from "@/src/constants";
import classnames from "classnames";
import { capitalize } from "lodash";
import { Filters } from "../BountyTable";
import { IAsyncResult } from "@/types/common";

interface BountyFiltersProps {
  mints: string[];
  tags: string[];
  orgs: string[];
  timeBounds: [number, number];
  filters: Filters;
  setFilters: (filters: Filters) => void;
  setBounties: (bounties: IAsyncResult<any[]>) => void;
}

export const BountyFilters = ({
  mints,
  tags,
  orgs,
  timeBounds,
  filters,
  setFilters,
  setBounties,
}: BountyFiltersProps) => {
  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="flex flex-col items-start gap-5 pl-10 pr-5 mt-16"
    >
      <div className="flex items-center gap-5">
        <input
          type="checkbox"
          className="w-8 h-8 accent-primaryBtn border border-primaryBtnBorder
          rounded-xl focus:ring-industryGreenBorder focus:border-green-500 cursor-pointer"
          onClick={() => {
            setBounties({ result: [] });
            setFilters({
              ...filters,
              isMyBounties: !filters.isMyBounties,
            });
          }}
        />
        <label className="font-bold">Only My Bounties</label>
      </div>
      <div className="flex flex-col gap-5">
        <label>Payout Mints</label>
        <MultiSelectDropdown
          options={mints.map((mint) => {
            return {
              value: mint,
              label: mint,
            };
          })}
          selected={filters.mints.map((mint) => {
            return {
              value: mint,
              label: mint,
            };
          })}
          onChange={(options) => {
            setFilters({
              ...filters,
              mints: options.map((option) => option.value),
            });
          }}
        />
      </div>
      <div className="flex flex-col gap-5">
        <label>Creators</label>
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
      </div>
      <div className="flex flex-col gap-5">
        <label>Requirements</label>
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
      </div>
      <div className="flex flex-col gap-5">
        <label>States</label>
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
              states: options.map((option) => option.value),
            });
          }}
        />
      </div>
      {/* <div className="flex flex-col gap-5" id="filter-time">
        <label htmlFor="estimatedTime">Estimated Time (hours)</label>
        <div className="range-bounds">
          <div>{timeBounds[0]}</div>
          <div>{timeBounds[1]}</div>
        </div>
        {timeBounds[0] !== 0 && (
          <RangeSlider
            bounds={timeBounds}
            setBounds={(bounds) => {
              setFilters({ ...filters, estimatedTimeBounds: bounds });
            }}
          />
        )}
      </div> */}
    </form>
  );
};
