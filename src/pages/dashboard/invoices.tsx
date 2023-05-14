import { formatRelative } from "date-fns";
import { atom, useAtom } from "jotai";
import { NextPage } from "next";
import React from "react";
import {
  Badge,
  Button,
  Color,
  Input,
  Modal
} from "~/components/base";
import {
  Dashboard,
  TheDashboardSidebar,
  useDashboardState,
  useSetDashboardTitle,
} from "~/layouts/Dashboard";
import { RouterInputs, RouterOutputs, api } from "~/utils/api";
import { Icons } from "~/utils/icons";
import { CustomerAvatar, CustomersAutocomplete } from "./customers";
import { ServicesAutocomplete } from "./services";

type CreateInvoice = RouterInputs["invoice"]["create"];
type Invoice = RouterOutputs["invoice"]["list"][0];

const invoicePageState = atom({
  selectedIds: [] as string[],
});

const useInvoicePageState = () => {
  const [pageState, setPageState] = useAtom(invoicePageState);

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

const useInvoices = () => api.invoice.list.useQuery(undefined);

export const useInvoiceActions = () => {
  const create = api.invoice.create.useMutation();
  const send = api.invoice.send.useMutation();
  const pay = api.invoice.pay.useMutation();
  const cancel = api.invoice.cancel.useMutation();
  const del = api.invoice.delete.useMutation();

  return {
    create,
    send,
    pay,
    cancel,
    delete: del,
  };
};

export const NewInvoiceModal: React.FC<{}> = ({}) => {
  const [, setDashboardState] = useDashboardState();
  const invoiceActions = useInvoiceActions();

  const [dueDate, setDueDate] = React.useState<CreateInvoice["dueDate"]>(
    new Date()
  );
  const [serviceIds, setServiceIds] = React.useState<
    CreateInvoice["serviceIds"]
  >([]);

  const [customerIds, setCustomerIds] = React.useState<
    CreateInvoice["customerIds"]
  >([]);

  const servicesQuery = api.service.ids.useQuery(serviceIds.filter(Boolean), {
    enabled: serviceIds.length > 0,
  });

  const onClose = () => {
    setDashboardState((state) => ({
      ...state,
      modals: state.modals.slice(0, state.modals.length - 1),
    }));
  };

  const doCreateInvoice = () => {
    invoiceActions.create.mutateAsync({
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

const Invoices: NextPage = () => {
  const { data: invoices } = useInvoices();
  const [, setDashboardState] = useDashboardState();
  const invoiceActions = useInvoiceActions();
  useSetDashboardTitle("Invoices");
  const ps = useInvoicePageState();

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
                invoiceActions.send.mutateAsync({ invoiceId });
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
          } as Record<Invoice["status"], Color>;

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
