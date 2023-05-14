import { UserButton } from "@clerk/nextjs";
import { Services } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { use, useState } from "react";
import { util, z } from "zod";
import type { RouterInputs, RouterOutputs } from "~/utils/api";

import { api } from "~/utils/api";

export const useServiceActions = () => {
  const createService = api.example.createService.useMutation();

  const handleCreateService = async ({
    name,
    price,
    description,
    children,
  }: RouterInputs["example"]["createService"]) => {
    await createService.mutateAsync({
      name,
      description,
      price: z.number().parse(price),
      children,
    });
  };

  return {
    createService: handleCreateService,
  };
};

export const useInvoiceActions = () => {
  const createInvoice = api.example.createInvoice.useMutation();
  const sendInvoice = api.example.sendInvoice.useMutation();
  const payInvoice = api.example.payInvoice.useMutation();
  const cancelInvoice = api.example.cancelInvoice.useMutation();
  const deleteInvoice = api.example.deleteInvoice.useMutation();

  const handleCreateInvoice = async ({
    serviceIds,
    dueDate,
  }: RouterInputs["example"]["createInvoice"]) => {
    await createInvoice.mutateAsync({
      serviceIds,
      dueDate,
    });
  };

  const handleSendInvoice = async ({
    invoiceId,
  }: RouterInputs["example"]["sendInvoice"]) => {
    await sendInvoice.mutateAsync({
      invoiceId,
    });
  };

  const handlePayInvoice = async ({
    invoiceId,
  }: RouterInputs["example"]["payInvoice"]) => {
    await payInvoice.mutateAsync({
      invoiceId,
    });
  };

  const handleCancelInvoice = async ({
    invoiceId,
  }: RouterInputs["example"]["cancelInvoice"]) => {
    await cancelInvoice.mutateAsync({
      invoiceId,
    });
  };

  const handleDeleteInvoice = async ({
    invoiceId,
  }: RouterInputs["example"]["deleteInvoice"]) => {
    await deleteInvoice.mutateAsync({
      invoiceId,
    });
  };

  return {
    createInvoice: handleCreateInvoice,
    sendInvoice: handleSendInvoice,
    payInvoice: handlePayInvoice,
    cancelInvoice: handleCancelInvoice,
    deleteInvoice: handleDeleteInvoice,
  };
};

export const useCustomerActions = () => {
  const createCustomer = api.example.createCustomer.useMutation();
  const addCustomerToInvoice = api.example.addCustomerToInvoice.useMutation();

  const handleCreateCustomer = async ({
    name,
    email,
  }: RouterInputs["example"]["createCustomer"]) => {
    await createCustomer.mutateAsync({
      name,
      email,
    });
  };

  const handleAddCustomerToInvoice = async ({
    customerId,
    invoiceId,
  }: RouterInputs["example"]["addCustomerToInvoice"]) => {
    await addCustomerToInvoice.mutateAsync({
      customerId,
      invoiceId,
    });
  };

  return {
    createCustomer: handleCreateCustomer,
    addCustomerToInvoice: handleAddCustomerToInvoice,
  };
};

const Home: NextPage = () => {
  const invoiceActions = useInvoiceActions();
  const serviceActions = useServiceActions();
  const customerActions = useCustomerActions();

  const [invoiceServiceId, setInvoiceServiceId] = useState<string>("");
  const [invoiceId, setInvoiceId] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");

  type A = Parameters<typeof api.example.services.useQuery>[1];

  const services = api.example.services.useQuery(undefined, {
    onSuccess: (data) => {
      if (data.length > 0) {
        setInvoiceServiceId(data[0]!.id);
      }
    },
  });
  const invoices = api.example.invoices.useQuery(undefined, {
    onSuccess: (data) => {
      if (data.length > 0) {
        setInvoiceId(data[0]!.id);
      }
    },
  });
  const customers = api.example.customers.useQuery(undefined, {
    onSuccess: (data) => {
      if (data.length > 0) {
        setCustomerId(data[0]!.id);
      }
    },
  });

  const createCustomer = api.example.createCustomer.useMutation();

  const addCustomerToInvoice = api.example.addCustomerToInvoice.useMutation();
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [children, setChildren] = useState<
    RouterInputs["example"]["createService"]["children"]
  >([]);
  const [cName, setCName] = useState("");
  const [cPrice, setCPrice] = useState<number>(0);

  const [invoiceDate, setInvoiceDate] = useState(() => new Date());
  const [invoiceServiceIds, setInvoiceServiceIds] = useState<
    RouterInputs["example"]["createInvoice"]["serviceIds"]
  >([]);

  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");

  // const handleCreateService = async () => {
  //   await createService
  //     .mutateAsync({
  //       name,
  //       price: z.number().parse(price),
  //       children,
  //     })
  //     .then(() => {
  //       services.refetch();
  //     });
  // };

  const addChild = () => {
    setChildren((prev) => [
      ...prev,
      {
        name: cName,
        price: z.number().parse(cPrice),
      },
    ]);
  };

  const addInvoiceChild = () => {
    setInvoiceServiceIds((prev) => [...prev, invoiceServiceId]);
  };

  // const handleCreateInvoice = async () => {
  //   await createInvoice
  //     .mutateAsync({
  //       serviceIds: invoiceServiceIds,
  //       dueDate: invoiceDate,
  //     })
  //     .then(() => {
  //       invoices.refetch();
  //     });
  // };

  // const handleCreateCustomer = async () => {
  //   await createCustomer
  //     .mutateAsync({
  //       name: customerName,
  //       email: customerEmail,
  //     })
  //     .then(() => {
  //       customers.refetch();
  //     });
  // };

  // const handleAddCustomerToInvoice = async () => {
  //   console.log({ customerId, invoiceId });
  //   await addCustomerToInvoice
  //     .mutateAsync({
  //       customerId,
  //       invoiceId,
  //     })
  //     .then(() => {
  //       invoices.refetch();
  //     });
  // };

  // const handleSendInvoice = async () => {
  //   await sendInvoice
  //     .mutateAsync({
  //       invoiceId,
  //     })
  //     .then(() => {
  //       invoices.refetch();
  //     });
  // };

  // const handlePayInvoice = async () => {
  //   await payInvoice
  //     .mutateAsync({
  //       invoiceId,
  //     })
  //     .then(() => {
  //       invoices.refetch();
  //     });
  // };

  // const handleCancelInvoice = async () => {
  //   await cancelInvoice
  //     .mutateAsync({
  //       invoiceId,
  //     })
  //     .then(() => {
  //       invoices.refetch();
  //     });
  // };

  // const handleDeleteInvoice = async () => {
  //   await deleteInvoice
  //     .mutateAsync({
  //       invoiceId,
  //     })
  //     .then(() => {
  //       invoices.refetch();
  //     });
  // };

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
              serviceActions.createService({
                name,
                price,
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
              invoiceActions.createInvoice({
                dueDate: invoiceDate,
                serviceIds: invoiceServiceIds,
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
              customerActions.createCustomer({
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
              customerActions.addCustomerToInvoice({
                customerId,
                invoiceId,
              })
            }
          >
            Add customer to invoice
          </button>

          <button onClick={() => invoiceActions.sendInvoice({ invoiceId })}>
            Send invoice
          </button>
          <button onClick={() => invoiceActions.payInvoice({ invoiceId })}>
            Pay invoice
          </button>
          <button onClick={() => invoiceActions.cancelInvoice({ invoiceId })}>
            Cancel invoice
          </button>
          <button onClick={() => invoiceActions.deleteInvoice({ invoiceId })}>
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
