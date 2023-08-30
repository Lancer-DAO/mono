import { Industry } from "@/types";
export type FORM_SECTION = "CREATE" | "MEDIA" | "PREVIEW" | "SUCCESS";

export interface FormData {
  issuePrice: string;
  issuePriceIcon?: string;
  issueTitle: string;
  issueDescription: string;
  industryId: number | null;
  displineIds?: number[];
  tags: string[];
  links: string[];
  media: string[];
  comment?: string;
  organizationName?: string;
  repositoryName?: string;
  estimatedTime?: string;
  isPrivate: boolean;
}

export interface ProfileFormData {
  industry: Industry | null;
  displayName: string;
  email: string;
  company: string;
  position: string;
  bio: string;
  linkedin: string;
  github: string;
  twitter: string;
  website: string;
}
