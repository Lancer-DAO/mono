export type FORM_SECTION = "CREATE" | "MEDIA" | "PREVIEW" | "SUCCESS" | "FUND";

export interface FormData {
  issuePrice: string;
  issueTitle: string;
  issueDescription: string;
  tags: string[];
  links: string[];
  media: string[];
  comment?: string;
  organizationName?: string;
  repositoryName?: string;
  estimatedTime?: string;
  isPrivate: boolean;
  industryIds?: number[];
  displineIds?: number[];
}
