export type FORM_SECTION = "CREATE" | "MEDIA" | "PREVIEW" | "SUCCESS" | "FUND";

export interface FormData {
  category: string;
  organizationName: string;
  repositoryName: string;
  issueTitle: string;
  issuePrice: string;
  issueDescription: string;
  requirements: string[];
  estimatedTime: string;
  isPrivate: boolean;
}
