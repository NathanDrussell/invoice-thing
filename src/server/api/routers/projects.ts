import { clerkClient } from "@clerk/nextjs";
import { Status } from "@prisma/client";
import { TRPCClientError } from "@trpc/client";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        customerIds: z.array(z.string()),
        serviceIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.project.create({
        data: {
          orgId: ctx.auth.orgId,
          name: input.name,
          customers: {
            create: input.customerIds.map((customerId) => ({
              customerId,
            })),
          },
          services: {
            create: input.serviceIds.map((serviceId) => ({
              serviceId,
            })),
          },
        },
      });
    }),

  // addCustomer: protectedProcedure
  //   .input(
  //     z.object({
  //       projectId: z.string().cuid(),
  //       customerId: z.string().cuid(),
  //     })
  //   )
  //   .mutation(({ input, ctx }) => {
  //     return ctx.prisma.customersProjects.upsert({
  //       where: {
  //         customerId_projectId: {
  //           customerId: input.customerId,
  //           projectId: input.projectId,
  //         },
  //       },
  //       create: {
  //         projectId: input.projectId,
  //         customerId: input.customerId,
  //       },
  //       update: {},
  //     });
  //   }),

  // addService: protectedProcedure
  //   .input(
  //     z.object({
  //       projectId: z.string().cuid(),
  //       serviceId: z.string().cuid(),
  //     })
  //   )
  //   .mutation(({ input, ctx }) => {
  //     return ctx.prisma.projectItem.upsert({
  //       where: {
  //         serviceId_projectId: {
  //           serviceId: input.serviceId,
  //           projectId: input.projectId,
  //         },
  //       },
  //       create: {
  //         projectId: input.projectId,
  //         serviceId: input.serviceId,
  //       },
  //       update: {},
  //     });
  //   }),

  list: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.project.findMany({
      where: { orgId: ctx.auth.orgId },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        invoices: {
          include: {
            invoice: true,
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

  // send: protectedProcedure
  //   .input(
  //     z.object({
  //       projectId: z.string().cuid(),
  //     })
  //   )
  //   .mutation(({ input, ctx }) => {
  //     return ctx.prisma.project.updateMany({
  //       where: { id: input.projectId, status: "draft" },
  //       data: {
  //         status: "sent",
  //       },
  //     });
  //   }),

  // pay: protectedProcedure
  //   .input(
  //     z.object({
  //       projectId: z.string().cuid(),
  //     })
  //   )
  //   .mutation(({ input, ctx }) => {
  //     return ctx.prisma.project.updateMany({
  //       where: { id: input.projectId, status: "sent" },
  //       data: { status: "paid" },
  //     });
  //   }),

  // delete: protectedProcedure
  //   .input(
  //     z.object({
  //       projectId: z.string().cuid(),
  //     })
  //   )
  //   .mutation(({ input, ctx }) => {
  //     return ctx.prisma.project.updateMany({
  //       where: { id: input.projectId, status: "draft" },
  //       data: { status: "deleted" },
  //     });
  //   }),

  // cancel: protectedProcedure
  //   .input(
  //     z.object({
  //       projectId: z.string().cuid(),
  //     })
  //   )
  //   .mutation(({ input, ctx }) => {
  //     return ctx.prisma.project.updateMany({
  //       where: { id: input.projectId, status: "sent" },
  //       data: { status: "draft" },
  //     });
  //   }),
});
