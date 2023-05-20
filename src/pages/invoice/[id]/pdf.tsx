import { faker } from "@faker-js/faker";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { api } from "~/utils/api";

const useOrg = () => {
  const org = useMemo(
    () => ({
      companyName: faker.company.name(),
      companyAddress: faker.location.streetAddress(),
      companyCity: faker.location.city(),
      companyState: faker.location.state(),
      companyZip: faker.location.zipCode(),
      companyPhone: faker.phone.number(),
      companyEmail: faker.internet.email(),
    }),
    []
  );

  return org;
};

const InvoicePdfPage: NextPage = () => {
  const route = useRouter();
  const invoice = api.invoice.get.useQuery(route.query.id as string, {
    enabled: !!route.query.id,
  });
  const org = useOrg();

  //   const customer = useOrg();
  const customer = invoice.data?.customers[0]?.customer;

  if (invoice.isLoading) return <div>Loading...</div>;
  if (invoice.isError) return <div>Error: {invoice.error.message}</div>;

  return (
    <>
      <style>
        {`
        .invoice-layout {
            grid-template-areas: "header header header"
                                 "orgAddress customerAddress customerAddress"
                                 "list list list"
                                 "empty summary summary"
                                 "footer footer footer";

            grid-template-rows: auto auto 1fr auto auto;


        }
        .grid-header {
            grid-area: header;
        }
        .grid-orgAddress {
            grid-area: orgAddress;
        }
        .grid-customerAddress {
            grid-area: customerAddress;
        }
        .grid-list {
            grid-area: list;
        }
        .grid-empty {
            grid-area: empty;
        }
        .grid-summary {
            grid-area: summary;
        }
        .grid-footer {
            grid-area: footer;
        }
        `}
      </style>
      <div className="invoice-layout rder-4 grid h-[11in] w-[8.5in] g-zinc-300 p-12">
        <div className="grid-header flex items-center justify-between">
          <span>
            <strong className="text-2xl">invoicething</strong>
            <h1 className="text-3xl font-black">
              Invoice - {route.query.id?.slice(0, 10)}
            </h1>
          </span>
          <div>
            <InvoiceKV name="Sent" value={new Date().toLocaleDateString()} />
            <InvoiceKV name="Due" value={invoice.data?.dueDate.toLocaleDateString()} />
            <InvoiceKV name="Total" value={invoice.data?.total.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })} />

          </div>
        </div>
        <div className="grid-orgAddress flex flex-col py-8">
          <span className="text-xl">{org.companyName}</span>
          <span>{org.companyAddress}</span>
          <span>
            {org.companyCity}, {org.companyState} {org.companyZip}
          </span>
          <span>{org.companyPhone}</span>
          <span>{org.companyEmail}</span>
        </div>
        <div className="grid-customerAddress flex flex-col py-8">
          <span className="text-xl">{customer?.name}</span>
          <span>{customer?.address}</span>
          <span>
            {customer?.city}, {customer?.state} {customer?.zip}{" "}
            {customer?.country}
          </span>
          <span>{customer?.phone}</span>
          <span>{customer?.email}</span>
        </div>
        <div className="grid-list">
          <div className="grid grid-cols-[3fr_1fr_1fr] grid-rows-1">
            <div className="h-fit w-full border-b-2 border-b-black px-4 py-2 font-bold">
              Item
            </div>
            <div className="h-fit w-full border-b-2 border-b-black px-4 py-2 font-bold">
              Quantity
            </div>
            <div className="h-fit w-full border-b-2 border-b-black px-4 py-2 font-bold">
              Price
            </div>
          </div>
          {invoice.data?.items?.map((item) => (
            <div className="grid grid-cols-[3fr_1fr_1fr] grid-rows-1 odd:bg-slate-200">
              <div className="h-fit w-full px-4 py-2">{item.service.name}</div>
              <div className="h-fit w-full px-4 py-2">{1}</div>
              <div className="h-fit w-full px-4 py-2">
                {item.service.price?.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </div>
            </div>
          ))}
          <div className="grid grid-cols-[3fr_1fr_1fr] grid-rows-1 border-t-2 border-black odd:bg-slate-200">
            <div className="h-fit w-full px-4 py-2">
              <strong>Total</strong>
            </div>
            <div className="h-fit w-full px-4 py-2">
              {invoice.data?.items?.length}
            </div>
            <div className="h-fit w-full px-4 py-2">
              {invoice.data?.total.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </div>
          </div>
        </div>
        <div className="grid-empty"></div>
        <div className="grid-summary flex justify-end">
        </div>
        <div className="grid-footer"></div>
      </div>
    </>
  );
};

export default InvoicePdfPage;
function InvoiceKV({ name = "", value = "" }) {
  return (
    <div className="grid grid-cols-[4rem_auto] text-sm">
      <strong>{name}</strong>
      {value}
    </div>
  );
}
