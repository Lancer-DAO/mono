import MultiSelectDropdown from "@/src/components/MultiSelectDropdown";
import { ISSUE_STATES } from "@/src/constants";
import { getMintName } from "@/src/utils";
import { Issue, IssueState } from "@/types";
import { useState } from "react";
import { capitalize } from "lodash";
import RangeSlider from "@/src/components/RangeSlider";
import { BountyCard } from "./bountyCard";
import { BountyFilters } from "./bountyFilters";
interface IssueList {
  issues: Issue[];
  mints: string[];
  tags: string[];
  orgs: string[];
  timeBounds: [number, number];
}

export type Filters = {
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

  const filteredIssues = issues.filter((issue) => {
    // debugger;
    if (!filters.mints.includes(getMintName(issue.mint))) {
      return false;
    }

    if (!filters.orgs.includes(issue.org)) {
      return false;
    }

    const issueTags = issue.tags || [];
    const commonTags = issueTags.filter((tag) => filters.tags.includes(tag));
    if (commonTags.length === 0) {
      return false;
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
      <BountyFilters
        mints={mints}
        tags={tags}
        timeBounds={timeBounds}
        orgs={orgs}
        filters={filters}
        setFilters={setFilters}
      />
      <div className="issue-list">
        {filteredIssues.map((issue, index) => (
          <BountyCard issue={issue} key={index} />
        ))}
      </div>
    </div>
  );
};

export default IssueList;
