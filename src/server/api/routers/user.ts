import { z } from "zod"

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc"
import { pwdhash } from "~/server/auth"

export const userRouter = createTRPCRouter({
  signup: publicProcedure
    .input(z.object({ email: z.string().min(1), password: z.string().min(8) }))
    .mutation(async ({ ctx, input }) => {
      const exist = await ctx.db.user.findFirst({
        where: {
          email: input.email
        }
      })

      if (exist) {
        throw new Error("Email already exists")
      }

      await ctx.db.user.create({
        data: {
          email: input.email,
          password: pwdhash(input.password)
        },
      })
      return { code: "ok" }
    }),
})
