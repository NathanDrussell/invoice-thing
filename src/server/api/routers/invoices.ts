import { clerkClient } from "@clerk/nextjs";
import { Status } from "@prisma/client";
import { TRPCClientError } from "@trpc/client";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const invoiceRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        dueDate: z.date(),
        serviceIds: z.array(z.string().cuid()),
        customerIds: z.array(z.string().cuid()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const {
        _sum: { price: total },
      } = await ctx.prisma.services.aggregate({
        where: { id: { in: input.serviceIds } },
        _sum: {
          price: true,
        },
      });
      if (!total) throw new TRPCClientError("No services found");
      return ctx.prisma.invoice.create({
        data: {
          orgId: ctx.auth.orgId,
          dueDate: input.dueDate,
          total,
          services: {
            connect: input.serviceIds.map((id) => ({ id })),
          },
        },
      });
    }),

  list: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.invoice.findMany({
      where: { status: { not: "deleted" }, orgId: ctx.auth.orgId },
      include: {
        services: true,
        customers: {
          select: {
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }),

  send: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string().cuid(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.invoice.updateMany({
        where: { id: input.invoiceId, status: "draft" },
        data: {
          status: "sent",
        },
      });
    }),

  pay: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string().cuid(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.invoice.updateMany({
        where: { id: input.invoiceId, status: "sent" },
        data: { status: "paid" },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string().cuid(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.invoice.updateMany({
        where: { id: input.invoiceId, status: "draft" },
        data: { status: "deleted" },
      });
    }),

  cancel: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string().cuid(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.invoice.updateMany({
        where: { id: input.invoiceId, status: "sent" },
        data: { status: "draft" },
      });
    }),
});
