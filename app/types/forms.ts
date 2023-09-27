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

interface Media {
  imageUrl: string;
  title: string;
  description: string;
}

export interface LancerUpdateData {
  bountyId: number;
  name: string;
  type: string;
  links: string;
  description: string;
  media: Media[];
}
