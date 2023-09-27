import { Industry } from "@/types";

export interface QuestFormData {
  issueTitle: string;
  issueDescription: string;
  industryId: number | null;
  tags: string[];
  links: string[];
  media: Media[];
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
  addedWen: number;
}
