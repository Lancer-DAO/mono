export type FORM_SECTION = "CREATE" | "MEDIA" | "PREVIEW" | "SUCCESS" | "FUND";

export interface FormData {
  category: string;
  issuePrice: string;
  issueTitle: string;
  issueDescription: string;
  requirements: string[];
  links: string[];
  comment?: string;
  organizationName?: string;
  repositoryName?: string;
  estimatedTime?: string;
  isPrivate: boolean;
}
