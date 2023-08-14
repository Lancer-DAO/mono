import MultiSelectDropdown from "@/components/molecules/MultiSelectDropdown";
import RangeSlider from "@/components/molecules/RangeSlider";
import { BOUNTY_STATES } from "@/src/constants";
import classnames from "classnames";
import { capitalize } from "lodash";
import { Filters } from "@/types";
import { IAsyncResult } from "@/types/common";

interface BountyFiltersProps {
  mints: string[];
  tags: string[];
  orgs: string[];
  priceBounds: [number, number];
  filters: Filters;
  setFilters: (filters: Filters) => void;
  setBounties: (bounties: IAsyncResult<any[]>) => void;
}

export const BountyFilters = ({
  mints,
  tags,
  orgs,
  priceBounds,
  filters,
  setFilters,
  setBounties,
}: BountyFiltersProps) => {
  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="flex flex-col items-start gap-6 pl-10 pr-5 mt-16"
    >
      <div className="flex items-center gap-3">
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
      <div className="w-full flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <p className="font-bold">Price Range:</p>
          <p className="text-sm">{`$${filters.estimatedPriceBounds[0]} - $${filters.estimatedPriceBounds[1]}`}</p>
        </div>

        {priceBounds[0] !== 0 && (
          <RangeSlider
            bounds={priceBounds}
            setBounds={(bounds) => {
              setFilters({ ...filters, estimatedPriceBounds: bounds });
            }}
          />
        )}
      </div>
      <div className="flex flex-col gap-3">
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
      <div className="flex flex-col gap-3">
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
      <div className="flex flex-col gap-3">
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
      <div className="flex flex-col gap-3">
        <label className="font-bold">Status</label>
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
    </form>
  );
};
