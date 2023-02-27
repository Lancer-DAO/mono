import MultiSelectDropdown from "@/src/components/MultiSelectDropdown";
import { ISSUE_STATES } from "@/src/constants";
import { getMintName } from "@/src/utils";
import { Issue, IssueState } from "@/types";
import { useState } from "react";
import { capitalize } from "lodash";
import RangeSlider from "@/src/components/RangeSlider";
interface IssueList {
  issues: Issue[];
  mints: string[];
  tags: string[];
  orgs: string[];
  timeBounds: [number, number];
}

type Filters = {
  mints: string[];
  orgs: string[];
  tags: string[];
  states: string[];
  estimatedTimeBounds: [number, number];
};

export const IssueList = ({
  issues,
  mints,
  tags,
  orgs,
  timeBounds,
}: IssueList) => {
  const [filters, setFilters] = useState<Filters>({
    mints: mints,
    tags: tags,
    orgs: orgs,
    estimatedTimeBounds: timeBounds,
    states: ISSUE_STATES,
  });
  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;

    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleTagChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = event.target;

    setFilters((prevState) => {
      const tags = prevState.tags || [];

      if (checked) {
        return {
          ...prevState,
          tags: [...tags, value],
        };
      } else {
        return {
          ...prevState,
          tags: tags.filter((tag) => tag !== value),
        };
      }
    });
  };

  const filteredIssues = issues.filter((issue) => {
    // debugger;
    if (!filters.mints.includes(getMintName(issue.mint))) {
      return false;
    }

    if (!filters.orgs.includes(issue.org)) {
      return false;
    }

    if (filters.tags.length > 0) {
      const issueTags = issue.tags || [];
      const commonTags = issueTags.filter((tag) => filters.tags.includes(tag));
      if (commonTags.length === 0) {
        return false;
      }
    }

    if (!filters.states.includes(issue.state)) {
      return false;
    }

    if (
      issue.estimatedTime < filters.estimatedTimeBounds[0] ||
      issue.estimatedTime > filters.estimatedTimeBounds[1]
    ) {
      return false;
    }

    return true;
  });
  return (
    <div className="bounty-table">
      <form
        onSubmit={(event) => event.preventDefault()}
        className="bounty-filters"
      >
        <div className="filter-section">
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
        <div className="filter-section">
          <label>Bounty Creators</label>
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
        <div className="filter-section">
          <label>Bounty Tags</label>
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
        <div className="filter-section">
          <label>Bounty States</label>
          <MultiSelectDropdown
            options={ISSUE_STATES.map((state) => {
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
        <div className="filter-section">
          <label htmlFor="estimatedTime">Estimated Time (hours)</label>
          <div className="range-bounds">
            <div>{timeBounds[0]}</div>
            <div>{timeBounds[1]}</div>
          </div>
          <RangeSlider
            bounds={timeBounds}
            setBounds={(bounds) => {
              setFilters({ ...filters, estimatedTimeBounds: bounds });
            }}
          />
        </div>
      </form>
      <div className="issue-list">
        {filteredIssues.map((issue, index) => (
          <a
            className="issue-card"
            key={index}
            href={`https://github.com/${issue.org}/${issue.repo}/issues/${issue.issueNumber}`}
            target="_blank"
            rel="noreferrer"
          >
            <div className="issue-header">
              <img
                className="contributor-picture"
                src={`https://avatars.githubusercontent.com/u/${117492794}?s=60&v=4`}
              />
              <div className="issue-amount">
                ${issue.amount} ({getMintName(issue.mint)})
              </div>
            </div>
            <div className="issue-repo">
              {issue.org}: {issue.repo}
            </div>
            <div className="issue-title">{issue.title}</div>

            <div className="issue-tags">
              {issue.tags.map((tag, index) => (
                <div className="tag" key={index}>
                  {capitalize(tag)}
                </div>
              ))}
            </div>

            <div className="issue-footer">
              <div className={`issue-state ${issue.state}`}>{issue.state}</div>
              <div className="issue-estimated-time">
                {issue.estimatedTime} hours
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default IssueList;
