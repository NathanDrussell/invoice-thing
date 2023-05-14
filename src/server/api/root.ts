import { customerRouter } from "~/server/api/routers/customers";
import { invoiceRouter } from "~/server/api/routers/invoices";
import { serviceRouter } from "~/server/api/routers/services";
import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  customer: customerRouter,
  invoice: invoiceRouter,
  service: serviceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
