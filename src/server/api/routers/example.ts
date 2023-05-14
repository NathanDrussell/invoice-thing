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
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

  servicesAc: publicProcedure
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
        },
      });
    }),

  services: publicProcedure.query(({ ctx }) => {
    console.log(ctx.auth?.user);
    return ctx.prisma.services.findMany({
      where: { parent: null },
      include: {
        children: true,
      },
    });
  }),

  listServices: publicProcedure
    .input(z.string().cuid().array())
    .query(({ input, ctx }) => {
      return ctx.prisma.services.findMany({
        where: { id: { in: input } },
        include: {
          children: true,
        },
      });
    }),

  createService: publicProcedure
    .input(createServiceSchema)
    .mutation(({ input, ctx }) => {
      return ctx.prisma.services.create({
        data: {
          name: input.name,
          price: input.price,
          children: {
            create: input.children.map((child) => ({
              name: child.name,
              description: child.description,
              price: child.price,
            })),
          },
        },
      });
    }),

  createInvoice: publicProcedure
    .input(
      z.object({
        dueDate: z.date(),
        serviceIds: z.array(z.string().cuid()),
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
          dueDate: input.dueDate,
          total,
          services: {
            connect: input.serviceIds.map((id) => ({ id })),
          },
        },
      });
    }),

  invoices: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.invoice.findMany({
      where: { status: { not: "deleted" } },
      include: {
        services: true,
        customers: true,
      },
    });
  }),

  createCustomer: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.customer.create({
        data: {
          name: input.name,
          email: input.email,
        },
      });
    }),

  customers: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.customer.findMany();
  }),

  addCustomerToInvoice: publicProcedure
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

  sendInvoice: publicProcedure
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

  payInvoice: publicProcedure
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

  deleteInvoice: publicProcedure
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

  cancelInvoice: publicProcedure
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
