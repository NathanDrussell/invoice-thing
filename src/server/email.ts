import sgMail from "@sendgrid/mail";
import { env } from "~/env.mjs";

sgMail.setApiKey(env.SENDGRID_API_KEY);

export const sendInvoice = async (link: string, pdf: Buffer) => {
  console.log(pdf)
  sgMail
    .send({
      to: "nathan@cryptonathan.io", // Change to your recipient
      from: {
        email: "nathan@cryptonathan.io", // Change to your verified sender
        name: "InvoiceThing",
      },
      subject: "Your invoice is ready! - InvoiceThing",
      html: `<a href="${link}">Click here to view your invoice</a><br /><a href="http://localhost:3000/unsubscribe>Click here to unsubscribe</a>`,
      attachments: [
        {
          content: pdf.toString("base64"),
          filename: "invoice.pdf",
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    })
    .then(() => {
      console.log("Email sent");
    });
};
