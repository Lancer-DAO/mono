export type FORM_SECTION = "CREATE" | "MEDIA" | "PREVIEW" | "SUCCESS" | "FUND";

export interface Media {
  imageUrl: string;
  title: string;
  description: string;
}

export interface FormData {
  issuePrice: string;
  issueTitle: string;
  issueDescription: string;
  tags: string[];
  links: string[];
  media: Media[];
  comment?: string;
  organizationName?: string;
  repositoryName?: string;
  estimatedTime?: string;
  isPrivate: boolean;
  industryIds?: number[];
  displineIds?: number[];
}
