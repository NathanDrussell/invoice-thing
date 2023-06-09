import { UserButton } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { use, useState } from "react";
import { util, z } from "zod";
import type { RouterInputs, RouterOutputs } from "~/utils/api";

import { api } from "~/utils/api";
import { useCustomerActions } from "./dashboard/customers";
import { useInvoiceActions } from "./dashboard/invoices";
import { useServiceActions } from "./dashboard/services";

const Home: NextPage = () => {
  const invoiceActions = useInvoiceActions();
  const serviceActions = useServiceActions();
  const customerActions = useCustomerActions();

  const [invoiceServiceId, setInvoiceServiceId] = useState<string>("");
  const [invoiceId, setInvoiceId] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");

  const services = api.service.list.useQuery(undefined, {
    onSuccess: (data) => {
      if (data.length > 0) {
        setInvoiceServiceId(data[0]!.id);
      }
    },
  });
  const invoices = api.invoice.list.useQuery(undefined, {
    onSuccess: (data) => {
      if (data.length > 0) {
        setInvoiceId(data[0]!.id);
      }
    },
  });
  const customers = api.customer.list.useQuery(undefined, {
    onSuccess: (data) => {
      if (data.length > 0) {
        setCustomerId(data[0]!.id);
      }
    },
  });

  const createCustomer = api.customer.create.useMutation();

  const addCustomerToInvoice = api.customer.addToInvoice.useMutation();
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0); const [children, setChildren] = useState<
    RouterInputs["service"]["create"]["children"]
  >([]);
  const [cName, setCName] = useState("");
  const [cDescription, setCDescription] = useState<string>("");
  const [cPrice, setCPrice] = useState<number>(0);

  const [invoiceDate, setInvoiceDate] = useState(() => new Date());
  const [invoiceServiceIds, setInvoiceServiceIds] = useState<
    RouterInputs["invoice"]["create"]["serviceIds"]
  >([]);

  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");

  const addChild = () => {
    setChildren((prev) => [
      ...prev,
      {
        name: cName,
        description: cDescription,
        price: z.number().parse(cPrice),
      },
    ]);
  };

  const addInvoiceChild = () => {
    setInvoiceServiceIds((prev) => [...prev, invoiceServiceId]);
  };

  const ctx = {
    invoiceServiceId,
    invoiceId,
    customerId,
    service: {
      name,
      price,
      children,
    },
    child: {
      cName,
      cPrice,
    },

    customers: customers.data || {},
    services: services.data || {},
    invoices: invoices.data || {},
  };

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto p-8">
        <div className=" flex flex-col">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Service name"
            autoFocus
            type="text"
          />
          <input
            value={price!}
            onChange={(e) => setPrice(e.target.valueAsNumber)}
            placeholder="Service price"
            autoFocus
            type="number"
          />
          <input
            value={cName}
            onChange={(e) => setCName(e.target.value)}
            placeholder="Child name"
            autoFocus
            type="text"
          />
          <input
            value={cPrice!}
            onChange={(e) => setCPrice(e.target.valueAsNumber)}
            placeholder="Child price"
            autoFocus
            type="number"
          />

          <button onClick={addChild}>Add child</button>

          <ul>
            {children.map((c, i) => (
              <li key={i}>
                {c.name} {c.price}
              </li>
            ))}
            {!children.length && <li>No children</li>}
          </ul>

          <button
            onClick={() =>
              serviceActions.create.mutate({
                name,
                price,
                description: "",
                children,
              })
            }
          >
            Add service
          </button>

          <select
            name=""
            id=""
            value={invoiceServiceId}
            onChange={(e) => setInvoiceServiceId(e.target.value)}
          >
            {/* <option className="text-gray-500" selected value={null!} disabled>
              Invoice
            </option> */}
            {services.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} #{s.id}
                {s.parentId ? ` - ${s.parentId}` : ""}
              </option>
            ))}
          </select>

          <input
            value={invoiceDate.toISOString().split("T")[0]}
            onChange={(e) => setInvoiceDate(e.target.valueAsDate!)}
            placeholder="Invoice date"
            type="date"
          />

          <button onClick={addInvoiceChild}>Add invoice child</button>
          <button
            onClick={() =>
              invoiceActions.create.mutateAsync({
                dueDate: invoiceDate,
                serviceIds: invoiceServiceIds,
                customerIds: [],
              })
            }
          >
            Add invoice
          </button>

          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Name"
            type="text"
          />
          <input
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Email"
            type="email"
          />

          <button
            onClick={() =>
              customerActions.create.mutate({
                name: customerName,
                email: customerEmail,
              })
            }
          >
            Add customer
          </button>

          <select
            name=""
            id=""
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            {/* <option className="text-gray-500" selected value={null!} disabled>
              Invoice
            </option> */}
            {customers.data?.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} | {customer.email}
              </option>
            ))}
          </select>

          <select
            name=""
            id=""
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
          >
            {/* <option className="text-gray-500" selected value={null!} disabled>
              Invoice
            </option> */}
            {invoices.data?.map((invoices) => (
              <option key={invoices.id} value={invoices.id}>
                invoice #{invoices.id} -{" "}
                {invoices.dueDate.toISOString().split("T")[0]}
              </option>
            ))}
          </select>

          <button
            onClick={() =>
              customerActions.addToInvoice.mutate({
                customerId,
                invoiceId,
              })
            }
          >
            Add customer to invoice
          </button>

          <button onClick={() => invoiceActions.send.mutate({ invoiceId })}>
            Send invoice
          </button>
          <button onClick={() => invoiceActions.pay.mutate({ invoiceId })}>
            Pay invoice
          </button>
          <button onClick={() => invoiceActions.cancel.mutate({ invoiceId })}>
            Cancel invoice
          </button>
          <button onClick={() => invoiceActions.delete.mutate({ invoiceId })}>
            Delete invoice
          </button>

          <pre className="mt-16">{JSON.stringify(ctx, null, 2)}</pre>
        </div>

        <UserButton />
      </main>
    </>
  );
};

export default Home;
