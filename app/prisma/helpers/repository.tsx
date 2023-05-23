import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const getOrCreateRepository = async (
  name: string,
  organization: string,
  isPrivate: boolean
): Promise<Prisma.Repository> => {
  let repository = await prisma.repository.findFirst({
    where: {
      name,
      organization,
    },
  });
  if (!repository) {
    repository = await prisma.repository.create({
      data: {
        name,
        organization,
        githubLink: `https://github.com/${organization}/${name}`,
        isPrivate,
      },
    });
  }
  return repository;
};

export const getRepository = async (
  name: string,
  organization: string
): Promise<Prisma.Repository> => {
  let repository = await prisma.repository.findFirstOrThrow({
    where: {
      name,
      organization,
    },
  });
  return repository;
};

export const getRepositoryByID = async (
  id: number
): Promise<Prisma.Repository> => {
  let repository = await prisma.repository.findFirstOrThrow({
    where: { id },
  });
  return repository;
};
