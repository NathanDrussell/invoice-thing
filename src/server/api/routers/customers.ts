import { clerkClient } from "@clerk/nextjs";
import { faker } from "@faker-js/faker";
import { Status } from "@prisma/client";
import { TRPCClientError } from "@trpc/client";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const customerRouter = createTRPCRouter({
  create: protectedProcedure
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

  list: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.customer.findMany({
      where: { orgId: ctx.auth.orgId },
    });
  }),

  byIds: protectedProcedure
    .input(z.array(z.string().cuid()))
    .query(({ ctx, input }) => {
      return ctx.prisma.customer.findMany({
        where: { orgId: ctx.auth.orgId, id: { in: input } },
      });
    }),

  ac: protectedProcedure
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

  addToInvoice: protectedProcedure
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

  seed: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.customer.create({
      data: {
        orgId: ctx.auth.orgId,
        email: faker.internet.email(),
        name: faker.person.fullName(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zip: faker.location.zipCode(),
        country: faker.location.country(),
      },
    });
  }),
});
