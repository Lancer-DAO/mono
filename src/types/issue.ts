export type Issue = {
    amount: number;
    hash?: string;
    title: string;
    issueNumber?: string;
    repo: string;
    fundingSplit?: ContributorCompensationInfo[];
    paid?: boolean;
    state: IssueState;
    type?: IssueType;
  };

  export type ContributorCompensationInfo = {
    pubkey: string;
    name: string;
    picture: string;
    amount: number;
    signature?: string;
  };

  export enum IssueState {
    NEW = "new",
    IN_PROGRESS = "in_progress",
    AWAITING_REVIEW = "awaiting_review",
    APPROVED = "approved",
    COMPLETE = "complete",
    CANCELED = "canceled",
  }

  export enum IssueType {
    BUG = "bug",
    DOCUMENTATION = "documentation",
    TEST = "test",
    FEATURE = "feature",
  }