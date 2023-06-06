import dayjs from "dayjs";

export interface ProfileNFT {
  name: string;
  reputation: number;
  badges: string[];
  certifications: string[];
  image: string;
  lastUpdated?: dayjs.Dayjs;
}

export interface BountyNFT {
  name: string;
  reputation: number;
  tags: string[];
  image: string;
  completed?: dayjs.Dayjs;
  description: string;
  role: string;
}
