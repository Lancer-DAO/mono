import { Industry } from "@/types";

export type FORM_SECTION = "CREATE" | "MEDIA" | "FUND" | "PREVIEW" | "SUCCESS";

export interface QuestFormData {
  requestQuote: boolean;
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
  isTest?: boolean;
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

export interface LancerApplyData {
  portfolio: string;
  linkedin: string;
  about: string;
  resume: string;
  details: string;
}

export interface LancerQuoteData {
  title: string;
  description: string;
  estimatedTime: number;
  price: number;
  state: QuestProgressState;
  checkpoints: Checkpoint[];
}

interface Media {
  imageUrl: string;
  title: string;
  description: string;
}

export enum QuestProgressState {
  NEW = "new",
  REJECTED = "rejected",
  ACCEPTED = "accepted",
}

export interface LancerUpdateData {
  bountyId: number;
  name: string;
  type: string;
  links: string;
  description: string;
  media: Media[];
  state: QuestProgressState;
}

export interface Checkpoint {
  title: string;
  price: number;
  description: string;
  estimatedTime: number;
  detailsOpen: boolean;
  canEdit: boolean;
}