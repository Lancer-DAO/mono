import { Media } from "./Bounties";

export type FORM_SECTION = "CREATE" | "MEDIA" | "FUND" | "PREVIEW" | "SUCCESS";

export interface FormData {
  issuePrice: string;
  issuePriceIcon?: string;
  issueTitle: string;
  issueDescription: string;
  industryId: number | null;
  displineIds?: number[];
  tags: string[];
  links: string[];
  media: Media[];
  comment?: string;
  organizationName?: string;
  repositoryName?: string;
  estimatedTime?: string;
  isPrivate: boolean;
}
