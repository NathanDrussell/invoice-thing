import { clerkClient } from "@clerk/nextjs";
import { Prisma, Status } from "@prisma/client";
import { TRPCClientError } from "@trpc/client";
import { z } from "zod";
import { downloadInvoice } from "~/pages/api/pdf/[id]";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const getInvoiceTotal = (invoiceId: string) =>
  prisma.service
    .aggregate({
      where: { invoices: { some: { invoiceId } } },
      _sum: {
        price: true,
      },
    })
    .then((r) => r._sum.price || 0);

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

  get: publicProcedure
    .input(z.string().cuid())
    .query(async ({ input, ctx }) => {
      return ctx.prisma.invoice.findUnique({
        where: { id: input },
        include: {
          items: {
            include: {
              service: true,
            },
          },
          customers: {
            include: {
              customer: true,
            },
          },
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

  removeCustomer: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string().cuid(),
        customerId: z.string().cuid(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.customersInvoices.delete({
        where: {
          customerId_invoiceId: {
            customerId: input.customerId,
            invoiceId: input.invoiceId,
          },
        },
      });
    }),

  addService: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string().cuid(),
        serviceId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.invoiceItem.upsert({
        where: {
          serviceId_invoiceId: {
            serviceId: input.serviceId,
            invoiceId: input.invoiceId,
          },
        },
        create: {
          serviceId: input.serviceId,
          invoiceId: input.invoiceId,
        },
        update: {},
      });

      await ctx.prisma.invoice.update({
        where: { id: input.invoiceId },
        data: {
          total: await getInvoiceTotal(input.invoiceId),
        },
      });
    }),

  removeService: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string().cuid(),
        serviceId: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.invoiceItem.delete({
        where: {
          serviceId_invoiceId: {
            serviceId: input.serviceId,
            invoiceId: input.invoiceId,
          },
        },
      });

      const total = await getInvoiceTotal(input.invoiceId);

      console.log({ total });

      await ctx.prisma.invoice.update({
        where: { id: input.invoiceId },
        data: {
          total,
        },
      });
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
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
    .mutation(async ({ input, ctx }) => {
      const pdf = await downloadInvoice(input.invoiceId);
      await ctx.emails.sendInvoice(
        "https://localhost:3000/public/pay/" + input.invoiceId,
        pdf
      );

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
