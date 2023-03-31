/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";

import { prisma } from "@/server/db";

type CreateContextOptions = {
  user: string | null;
};

import { Magic } from "@magic-sdk/admin";
import { env } from "@/env.mjs";
const magic = new Magic(env.MAGIC_KEY);

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
const createInnerTRPCContext = async (_opts: CreateContextOptions) => {
  return {
    user: _opts.user,
    prisma,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (_opts: CreateNextContextOptions) => {
  const session = getCookie("session", {
    req: _opts.req,
  }) as string;

  try {
    const metadata = await magic.users.getMetadataByToken(session);

    const user = await prisma.user.findUnique({
      where: {
        email: metadata.email!,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      new TRPCError({
        code: "UNAUTHORIZED",
      });
    }

    return createInnerTRPCContext({
      user: user ? user.id : null,
    });
  } catch {
    return createInnerTRPCContext({
      user: null,
    });
  }
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { getCookie } from "cookies-next";

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

export const middleware = t.middleware;

const isUser = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const protectedProcedure = publicProcedure.use(isUser);
