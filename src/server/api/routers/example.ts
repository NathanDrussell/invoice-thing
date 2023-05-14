import { clerkClient } from "@clerk/nextjs";
import { Status } from "@prisma/client";
import { TRPCClientError } from "@trpc/client";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const _createServiceSchema = z.object({
  name: z.string().trim(),
  description: z.string().trim(),
  price: z.number().positive(),
});

const createServiceSchema = _createServiceSchema.extend({
  children: z.array(_createServiceSchema),
});

export const exampleRouter = createTRPCRouter({
  hello: protectedProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

  servicesAc: protectedProcedure
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

  services: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.services.findMany({
      where: { parent: null, orgId: ctx.auth.orgId },
      include: {
        children: true,
      },
    });
  }),

  listServices: protectedProcedure
    .input(z.string().cuid().array())
    .query(({ input, ctx }) => {
      return ctx.prisma.services.findMany({
        where: { id: { in: input }, orgId: ctx.auth.orgId },
        include: {
          children: true,
        },
      });
    }),

  createService: protectedProcedure
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

  createInvoice: protectedProcedure
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

  invoices: protectedProcedure.query(({ ctx }) => {
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

  createCustomer: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.customer.create({
        data: {
          orgId: ctx.auth.orgId,
          name: input.name,
          email: input.email,
        },
      });
    }),

  customers: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.customer.findMany({
      where: { orgId: ctx.auth.orgId },
    });
  }),

  customersAc: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(),
      })
    )
    .query(({ input, ctx }) => {
      return ctx.prisma.customer.findMany({
        where: {
          name: {
            contains: input.query,
          },
          orgId: ctx.auth.orgId,
        },
      });
    }),

  addCustomerToInvoice: protectedProcedure
    .input(
      z.object({
        customerId: z.string().cuid(),
        invoiceId: z.string().cuid(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.invoice
        .update({
          where: { id: input.invoiceId },
          data: {
            customers: {
              connectOrCreate: {
                where: {
                  customerId_invoiceId: {
                    invoiceId: input.invoiceId,
                    customerId: input.customerId,
                  },
                },
                create: {
                  customerId: input.customerId,
                },
              },
            },
          },
        })
        .catch((e) => {
          console.log(e.stack);
          return e;
        });
    }),

  sendInvoice: protectedProcedure
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

  payInvoice: protectedProcedure
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

  deleteInvoice: protectedProcedure
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

  cancelInvoice: protectedProcedure
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
