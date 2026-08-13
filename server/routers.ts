import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { portalProcedure } from "./_core/trpc";
import { createCustomerServiceRequest, getCustomerPortalSummary } from "./portalDb";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  portal: router({
    summary: portalProcedure.query(({ ctx }) => getCustomerPortalSummary(ctx.supabaseUser.id)),
    createRequest: portalProcedure.input(z.object({
      propertyId: z.string().uuid(),
      serviceType: z.string().trim().min(2).max(120),
      preferredDate: z.string().date(),
      notes: z.string().trim().max(2000).optional(),
    })).mutation(({ ctx, input }) => createCustomerServiceRequest({
      profileId: ctx.supabaseUser.id,
      propertyId: input.propertyId,
      serviceType: input.serviceType,
      preferredDate: input.preferredDate,
      notes: input.notes,
    })),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
