import dayjs from "dayjs";

export type ProfileNFT = {
  name: string;
  reputation: number;
  badges: string[];
  certifications: string[];
  image: string;
  lastUpdated?: dayjs.Dayjs;
};

export type BountyNFT = {
  name: string;
  reputation: number;
  tags: string[];
  image: string;
  completed?: dayjs.Dayjs;
  description: string;
  role: string;
  id: number;
};
