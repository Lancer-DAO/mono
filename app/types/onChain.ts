import dayjs from "dayjs";

export type ProfileNFT = {
  name: string;
  experience: number;
  badges: string[];
  certifications: string[];
  image: string;
  lastUpdated?: dayjs.Dayjs;
};

export type BountyNFT = {
  name: string;
  experience: number;
  tags: string[];
  image: string;
  completed?: dayjs.Dayjs;
  description: string;
  role: string;
  id: number;
};
