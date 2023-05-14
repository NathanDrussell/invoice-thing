import { UserButton } from "@clerk/nextjs";
import { Combobox } from "@headlessui/react";
import { formatRelative } from "date-fns";
import { atom, useAtom } from "jotai";
import { NextPage } from "next";
import React, {
  Children,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button,
  Input,
  Modal,
  Textarea,
  inputClassName,
} from "~/components/base";
import {
  Dashboard,
  TheDashboardSidebar,
  useDashboardState,
  useSetDashboardTitle,
} from "~/layouts/Dashboard";
import { RouterInputs, RouterOutputs, api } from "~/utils/api";
import { cn } from "~/utils/cn";
import { Icons } from "~/utils/icons";
import { useInvoiceActions, useServiceActions } from "..";
import { CustomerAvatar } from "./customers";

type CreateInvoice = RouterInputs["example"]["createInvoice"];
type Invoice = RouterOutputs["example"]["invoices"][0];

const servicePageState = atom({
  selectedIds: [] as string[],
});

const useServicePageState = () => {
  const [pageState, setPageState] = useAtom(servicePageState);

  return {
    selectedIds: pageState.selectedIds,

    toggle: (id: string) => {
      setPageState((state) => {
        if (state.selectedIds.includes(id)) {
          return {
            ...state,
            selectedIds: state.selectedIds.filter((selectedId) => {
              return selectedId !== id;
            }),
          };
        } else {
          return {
            ...state,
            selectedIds: [...state.selectedIds, id],
          };
        }
      });
    },
  };
};

// export const ServicesAutocomplete = ({}) => {
//   const [query, setQuery] = React.useState<string>("");

//   return (
//     <div className="relative">
//       <Input
//         label=""
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//         placeholder="Add a service..."
//       ></Input>

//       <div className="absolute top-full  w-full  rounded bg-white p-2 shadow">
//         {services?.map((service) => (
//           <div className="flex items-center gap-2 p-2">
//             {service.name}{" "}
//             {service.price.toLocaleString("en-US", {
//               style: "currency",
//               currency: "CAD",
//               //   compactDisplay: "short",
//               currencyDisplay: "symbol",
//             })}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

export const ServicesAutocomplete = ({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) => {
  const lastSelectedService = useRef<string>("");
  const [selectedService, setSelectedService] = useState<string | Symbol>("");
  const [query, setQuery] = useState("");

  const { data: services } = api.example.servicesAc.useQuery(
    { query },
    {
      enabled: query.length >= 0,
    }
  );

  useEffect(() => {
    if (!selectedService) return;
    if (selectedService === Symbol.for("new")) {
      // open modal
    } else {
      if (selectedService !== lastSelectedService.current) {
        lastSelectedService.current = selectedService as string;
        onSelect(selectedService as string);
        setSelectedService("");
      }
    }
  }, [selectedService]);

  return (
    <Combobox
      value={selectedService}
      onChange={setSelectedService}
      as={"div"}
      className="relative"
    >
      <Combobox.Input
        placeholder="Add a service..."
        className={inputClassName}
        onChange={(event) => setQuery(event.target.value)}
        displayValue={(value: RouterOutputs["example"]["servicesAc"][0]) =>
          value.name
        }
      />
      <Combobox.Options className="absolute top-full z-50 mt-2 w-full rounded  border bg-white shadow-lg">
        {services?.map((service) => (
          <Combobox.Option key={service.id} value={service.id} as={Fragment}>
            {({ active, selected }) => (
              <li
                className={cn(
                  "flex w-full items-center gap-2 p-2 capitalize",
                  active ? "bg-slate-100" : ""
                )}
              >
                {selected ? <Icons.Check /> : null}
                <Badge>
                  {service.price.toLocaleString("en-US", {
                    style: "currency",
                    currency: "CAD",
                    //   compactDisplay: "short",
                    currencyDisplay: "symbol",
                  })}
                </Badge>
                {service.name}
              </li>
            )}
          </Combobox.Option>
        ))}
        {services?.length === 0 && (
          <Combobox.Option value={Symbol.for("new")} className="w-full p-2">
            Add a new service
          </Combobox.Option>
        )}
      </Combobox.Options>
    </Combobox>
  );
};

export const CustomersAutocomplete = ({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) => {
  const lastSelectedService = useRef<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | Symbol>("");
  const [query, setQuery] = useState("");

  const { data: customers } = api.example.customersAc.useQuery(
    { query },
    {
      enabled: query.length >= 0,
    }
  );

  useEffect(() => {
    if (!selectedCustomer) return;
    if (selectedCustomer === Symbol.for("new")) {
      // open modal
    } else {
      if (selectedCustomer !== lastSelectedService.current) {
        lastSelectedService.current = selectedCustomer as string;
        onSelect(selectedCustomer as string);
        setSelectedCustomer("");
      }
    }
  }, [selectedCustomer]);

  return (
    <Combobox
      value={selectedCustomer}
      onChange={setSelectedCustomer}
      as={"div"}
      className="relative"
    >
      <Combobox.Input
        placeholder="Add a customer..."
        className={inputClassName}
        onChange={(event) => setQuery(event.target.value)}
        displayValue={(value: RouterOutputs["example"]["servicesAc"][0]) =>
          value.name
        }
      />
      <Combobox.Options className="absolute top-full z-50 mt-2 w-full rounded  border bg-white shadow-lg">
        {customers?.map((service) => (
          <Combobox.Option key={service.id} value={service.id} as={Fragment}>
            {({ active, selected }) => (
              <li
                className={cn(
                  "flex w-full items-center gap-2 p-2 capitalize",
                  active ? "bg-slate-100" : ""
                )}
              >
                {selected ? <Icons.Check /> : null}
                {service.name}
              </li>
            )}
          </Combobox.Option>
        ))}
        {customers?.length === 0 && (
          <Combobox.Option value={Symbol.for("new")} className="w-full p-2">
            Add a new service
          </Combobox.Option>
        )}
      </Combobox.Options>
    </Combobox>
  );
};

const colorClasses = {
  gray: "bg-gray-50 text-gray-800 ring-gray-600/20",
  red: "bg-red-50 text-red-800 ring-red-600/20",
  yellow: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
  green: "bg-green-50 text-green-800 ring-green-600/20",
  blue: "bg-blue-50 text-blue-800 ring-blue-600/20",
  indigo: "bg-indigo-50 text-indigo-800 ring-indigo-600/20",
  purple: "bg-purple-50 text-purple-800 ring-purple-600/20",
  pink: "bg-pink-50 text-pink-800 ring-pink-600/20",
} as const;
const Badge: React.FC<{
  children: React.ReactNode;
  color?: keyof typeof colorClasses;
}> = ({ color = "yellow", children }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
        colorClasses[color]
      )}
    >
      {children}
    </span>
  );
};

export const NewInvoiceModal: React.FC<{}> = ({}) => {
  const [, setDashboardState] = useDashboardState();
  const { createInvoice } = useInvoiceActions();

  const [dueDate, setDueDate] = React.useState<CreateInvoice["dueDate"]>(
    new Date()
  );
  const [serviceIds, setServiceIds] = React.useState<
    CreateInvoice["serviceIds"]
  >([]);

  const [customerIds, setCustomerIds] = React.useState<
    CreateInvoice["customerIds"]
  >([]);

  const servicesQuery = api.example.listServices.useQuery(
    serviceIds.filter(Boolean),
    {
      enabled: serviceIds.length > 0,
    }
  );

  const onClose = () => {
    setDashboardState((state) => ({
      ...state,
      modals: state.modals.slice(0, state.modals.length - 1),
    }));
  };

  const doCreateInvoice = () => {
    createInvoice({
      dueDate,
      customerIds,
      serviceIds: serviceIds.filter(Boolean),
    });
  };

  return (
    <Modal
      title="Add Service"
      onClose={onClose}
      actions={
        <div className="flex gap-2">
          <Button label="Cancel" onClick={onClose} />
          <Button label="Save" onClick={doCreateInvoice} />
        </div>
      }
    >
      <div className="flex gap-2">
        <Input
          value={dueDate.toISOString().split("T")[0]}
          onChange={(e) => setDueDate(e.target.valueAsDate!)}
          label="Due date"
          wrapperClassName="w-full"
          type="date"
        />
      </div>

      <ServicesAutocomplete
        onSelect={(id) => setServiceIds((ids) => [...ids, id])}
      />

      <CustomersAutocomplete
        onSelect={(id) => setCustomerIds((ids) => [...ids, id])}
      />

      {servicesQuery.data?.map((service) => {
        return <div key={service.id}>{service.name}</div>;
      })}

      {/* <Textarea
        label="Description"
        value={description}
        rows={5}
        onChange={(e) => setDescription(e.target.value)}
      /> */}
    </Modal>
  );
};

const useInvoices = () => api.example.invoices.useQuery(undefined);

const Invoices: NextPage = () => {
  const { data: invoices } = useInvoices();
  const [, setDashboardState] = useDashboardState();
  const { sendInvoice } = useInvoiceActions();
  useSetDashboardTitle("Invoices");
  const ps = useServicePageState();

  //   useEffect(() => {
  //     setDashboardState((state) => ({ ...state, title: "Invoices" }));
  //   }, []);

  const openModal = () => {
    setDashboardState((state) => ({
      ...state,
      modals: [...state.modals, <NewInvoiceModal key={state.modals.length} />],
    }));
  };

  return (
    <Dashboard
      sidebar={<TheDashboardSidebar />}
      actions={
        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={() => openModal()}
            icon={<Icons.Plus className="text-black" />}
            label="ADD"
          />
          {/* // send */}
          <Button
            disabled={ps.selectedIds.length === 0}
            onClick={() => {
              ps.selectedIds.forEach((invoiceId: string) => {
                sendInvoice({ invoiceId });
              });
            }}
            icon={<Icons.PaperPlaneTilt className="text-black" />}
            label="SEND"
          />

          <Button
            disabled={ps.selectedIds.length === 0}
            onClick={() => {
              console.log(ps.selectedIds);
            }}
            icon={<Icons.Trash className="text-black" />}
            label="DELETE"
          />
        </div>
      }
    >
      <div className="h-full w-full overflow-hidden rounded border">
        {invoices?.map((invoice) => {
          const statusColors = {
            draft: "gray",
            sent: "blue",
            paid: "green",
            canceled: "red",
            deleted: "red",
          } as Record<(typeof invoice)["status"], keyof typeof colorClasses>;

          return (
            <div onClick={() => ps.toggle(invoice.id)}>
              <div className="flex border-b">
                <div key={invoice.id} className="flex w-fit gap-2 p-2">
                  <div className="flex w-fit items-center gap-2">
                    <input
                      type="checkbox"
                      checked={ps.selectedIds.includes(invoice.id)}
                      name=""
                      id=""
                    />
                    <strong>{invoice.id}</strong>
                  </div>
                  {invoice.status === "sent" && (
                    <Badge
                      color={+invoice.dueDate < +new Date() ? "red" : "gray"}
                    >
                      due{" "}
                      {
                        // invoice.dueDate.toLocaleString("en-US", {
                        //   numberingSystem: ""
                        // })
                        formatRelative(invoice.dueDate, new Date())
                      }
                    </Badge>
                  )}
                </div>
                <div className="ml-auto"></div>
                <div className="flex -space-x-2">
                  {invoice.customers.map(({ customer }, i) => (
                    <CustomerAvatar
                      key={customer?.id || i}
                      name={customer?.name || ""}
                    />
                  ))}
                </div>
                <div className="mr-8 flex max-w-md flex-wrap items-center gap-1 py-2 text-xs">
                  {invoice.services
                    ?.map((service) => service.name)
                    .map((name) => (
                      <div className="rounded border p-1 capitalize leading-none">
                        {name}
                      </div>
                    ))}
                </div>
                <div className="mr-8 flex items-center gap-2">
                  {invoice.total.toLocaleString("en-US", {
                    style: "currency",
                    currency: "CAD",
                    //   compactDisplay: "short",
                    currencyDisplay: "symbol",
                  })}
                  {invoice.status === "sent" && invoice.dueDate < new Date() ? (
                    <Badge color="red">
                      <Icons.Warning className="mr-1" />
                      overdue
                    </Badge>
                  ) : (
                    <Badge color={statusColors[invoice.status]}>
                      {invoice.status}
                    </Badge>
                  )}
                </div>
                <button className="flex items-center gap-2 border-b p-2 pr-4 font-semibold text-blue-600 last-of-type:border-b-0  hover:bg-slate-100 focus:ring-1 active:ring-2">
                  <Icons.Pencil />
                  Edit
                </button>
              </div>
              {/* <div className="border-b bg-neutral-100 pl-4">
              {invoice?.children.map((child) => (
                <div className="flex items-center border-b last:border-b-0">
                  <div className="w-fit p-2">
                    <div className="flex w-fit items-center gap-2">
                      <input type="checkbox" name="" id="" />
                      <strong>{child.name}</strong>
                    </div>
                    <p>{child.description}</p>
                  </div>
                  <div className="ml-auto"></div>
                  <div className="mr-8">
                    {invoice.price.toLocaleString("en-US", {
                      style: "currency",
                      currency: "CAD",
                      //   compactDisplay: "short",
                      currencyDisplay: "symbol",
                    })}
                  </div>
                  <div>
                    <button className="flex items-center gap-2 border-b p-2 pr-4 font-semibold text-blue-600 last-of-type:border-b-0  hover:bg-slate-100 focus:ring-1 active:ring-2">
                      <Icons.Pencil />
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div> */}
            </div>
          );
        })}
      </div>
    </Dashboard>
  );
};

export default Invoices;
