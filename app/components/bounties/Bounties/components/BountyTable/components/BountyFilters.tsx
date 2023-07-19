import MultiSelectDropdown from "@/components/molecules/MultiSelectDropdown";
import RangeSlider from "@/components/molecules/RangeSlider";
import { BOUNTY_STATES, TABLE_MY_BOUNTY_STATES } from "@/src/constants";
import classnames from "classnames";
import { capitalize } from "lodash";
import { Filters } from "../BountyTable";

interface BountyFiltersProps {
  mints: string[];
  tags: string[];
  orgs: string[];
  timeBounds: [number, number];
  filters: Filters;
  setFilters: (filters: Filters) => void;
  setBounties: (bounties: any[]) => void;
}

const BountyFilters = ({
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
      className="bounty-filters"
      id="bounty-filters"
    >
      <div className="filter-section" id="filter-my-bounties">
        <label className="w-checkbox checkbox-field-2 label-only ">
          <div
            className={classnames(
              "w-checkbox-input w-checkbox-input--inputType-custom checkbox ",
              {
                checked: filters.isMyBounties,
              }
            )}
            onClick={() => {
              setFilters({
                ...filters,
                isMyBounties: !filters.isMyBounties,
                states: TABLE_MY_BOUNTY_STATES,
              });
              setBounties([]);
            }}
          />

          <label className="check-label label-only">Only My Bounties</label>
        </label>
      </div>
      <div className="filter-section" id="filter-payout-mints">
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
      <div className="filter-section" id="filter-creators">
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
      <div className="filter-section" id="filter-requirements">
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
      <div className="filter-section" id="filter-states">
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
      <div className="filter-section" id="filter-time">
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
      </div>
    </form>
  );
};

export default BountyFilters;
