import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure
} from "~/server/api/trpc";

const _createServiceSchema = z.object({
  name: z.string().trim(),
  description: z.string().trim(),
  price: z.number().positive(),
});

const createServiceSchema = _createServiceSchema.extend({
  children: z.array(_createServiceSchema),
});

export const serviceRouter = createTRPCRouter({
  ac: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(),
      })
    )
    .query(({ input, ctx }) => {
      return ctx.prisma.services.findMany({
        where: {
          name: {
            contains: input.query,
          },
          orgId: ctx.auth.orgId,
        },
      });
    }),

  list: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.services.findMany({
      where: { parent: null, orgId: ctx.auth.orgId },
      include: {
        children: true,
      },
    });
  }),

  ids: protectedProcedure
    .input(z.string().cuid().array())
    .query(({ input, ctx }) => {
      return ctx.prisma.services.findMany({
        where: { id: { in: input }, orgId: ctx.auth.orgId },
        include: {
          children: true,
        },
      });
    }),

  create: protectedProcedure
    .input(createServiceSchema)
    .mutation(({ input, ctx }) => {
      return ctx.prisma.services.create({
        data: {
          orgId: ctx.auth.orgId,
          name: input.name,
          price: input.price,
          children: {
            create: input.children.map((child) => ({
              orgId: ctx.auth.orgId,
              name: child.name,
              description: child.description,
              price: child.price,
            })),
          },
        },
      });
    }),
});
