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
      } = await ctx.prisma.service.aggregate({
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
          items: {
            createMany: {
              data: input.serviceIds.map((serviceId) => ({ serviceId })),
            },
          },
          customers: {
            create: input.customerIds.map((customerId) => ({
              customerId,
            })),
          },

          // services: {
          //   connect: input.serviceIds.map((id) => ({ id })),
          // },
        },
      });
    }),

  addCustomer: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string().cuid(),
        customerId: z.string().cuid(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.customersInvoices.upsert({
        where: {
          customerId_invoiceId: {
            customerId: input.customerId,
            invoiceId: input.invoiceId,
          },
        },
        create: {
          invoiceId: input.invoiceId,
          customerId: input.customerId,
        },
        update: {},
      });
    }),

  addService: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string().cuid(),
        serviceId: z.string().cuid(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.invoiceItem.upsert({
        where: {
          serviceId_invoiceId: {
            serviceId: input.serviceId,
            invoiceId: input.invoiceId,
          },
        },
        create: {
          invoiceId: input.invoiceId,
          serviceId: input.serviceId,
        },
        update: {},
      });
    }),

  list: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.invoice.findMany({
      where: { status: { not: "deleted" }, orgId: ctx.auth.orgId },
      include: {
        items: {
          include: {
            service: true,
          },
        },
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
