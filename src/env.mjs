import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
      .string()
      .startsWith(process.env.NODE_ENV === "production" ? "pk_" : "pk_test_"),
    CLERK_SECRET_KEY: z
      .string()
      .startsWith(process.env.NODE_ENV === "production" ? "sk" : "sk_test_"),
    SENDGRID_API_KEY: z.string().startsWith("SG."),
    UPLOADTHING_SECRET: z.string().startsWith("sk_live_"),
    UPLOADTHING_APP_ID: z.string(),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    AWS_REGION: z.string(),
    AWS_BUCKET: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_BUCKET: process.env.AWS_BUCKET,

    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
});
