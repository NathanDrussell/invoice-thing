// this imports a bare-bones version of S3 that exposes the .send operation
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// this imports just the getObject operation from S3
import * as Commands from "@aws-sdk/client-s3";
// api/run.js
import { getAuth } from "@clerk/nextjs/server";
import edgeChromium from "chrome-aws-lambda";

// Importing Puppeteer core as default otherwise
// it won't function correctly with "launch()"
import puppeteer from "puppeteer-core";
import { z } from "zod";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";

const CACHED_ENABLED = true;

// You may want to change this if you're developing
// on a platform different from macOS.
// See https://github.com/vercel/og-image for a more resilient
// system-agnostic options for Puppeteeer.
const LOCAL_CHROME_EXECUTABLE =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const bareBonesS3 = new Commands.S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const downloadPdf = async (url: URL) => {
  const executablePath =
    (await edgeChromium.executablePath) || LOCAL_CHROME_EXECUTABLE;

  const browser = await puppeteer.launch({
    executablePath,
    args: [
      ...edgeChromium.args,
      "--disable-infobars",
      "--disable-web-security",
      "--disable-features=IsolateOrigins",
      "--disable-site-isolation-trials",
    ],
    headless: true,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });
  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    origin: url.origin,
  });
  await page.goto(url.toString(), {
    waitUntil: "networkidle2",
  });
  const pdf = await page.pdf({ format: "LETTER", displayHeaderFooter: false });
  await page.waitForNetworkIdle();

  return { pdf, cleanup: () => browser.close() };
};

export const downloadInvoice = async (id: string) => {
  return new Promise<Buffer>(async (resolve) => {
    const validCuid = z.string().cuid().parse(id);

    if (CACHED_ENABLED) {
      const generatedPdf = await bareBonesS3
        .send(
          new Commands.GetObjectCommand({
            Bucket: env.AWS_BUCKET,
            Key: `${validCuid}.pdf`,
          })
        )
        .catch((e) => {
          return {
            Body: null,
          };
        });

      if (generatedPdf.Body) {
        return resolve(
          Buffer.from(await generatedPdf.Body.transformToByteArray())
        );
      }
    }

    const url = new URL("http://localhost:3000/invoice/" + validCuid + "/pdf");
    console.log(url.toString());
    const { pdf, cleanup } = await downloadPdf(url);

    resolve(pdf); // Resolve the promise with the PDF before uploading it to S3

    await Promise.all([
      cleanup(),
      !CACHED_ENABLED
        ? Promise.resolve(null)
        : bareBonesS3.send(
            new Commands.PutObjectCommand({
              Bucket: env.AWS_BUCKET,
              Key: `${validCuid}.pdf`,
              Body: pdf,
              ContentType: "application/pdf",
            })
          ),
    ]);
  });
};

export default async function (req: any, res: any) {
  if (!req.query.id) return res.status(404).send("Not found");

  const pdf = await downloadInvoice(req.query.id);

  res.setHeader("Content-Type", "application/pdf");
  res.send(pdf);
}
