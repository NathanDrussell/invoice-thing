import { Combobox } from "@headlessui/react";
import { NextPage } from "next";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { Button, Input, Modal, inputClassName } from "~/components/base";
import {
  Dashboard,
  TheDashboardSidebar,
  useDashboardState,
  useSetDashboardTitle,
} from "~/layouts/Dashboard";
import { RouterInputs, RouterOutputs, api } from "~/utils/api";
import { cn } from "~/utils/cn";
import { useSeededHslColor } from "~/utils/hsl";
import { Icons } from "~/utils/icons";

type CreateCustomer = RouterInputs["customer"]["create"];

export const useCustomerActions = () => {
  const create = api.customer.create.useMutation();
  const addToInvoice = api.customer.addToInvoice.useMutation();
  const seed = api.customer.seed.useMutation();

  return {
    create,
    addToInvoice,
    seed,
  };
};

export const useCustomers = () => api.customer.list.useQuery(undefined);

export const NewCustomerModals: React.FC<{
  onClose: (id?: string) => void;
}> = ({ onClose }) => {
  const [, setDashboardState] = useDashboardState();
  const { create } = useCustomerActions();

  const [name, setName] = React.useState<CreateCustomer["name"]>("");
  const [email, setEmail] = React.useState<CreateCustomer["email"]>("");

  const doCreateCustomer = () => {
    create.mutateAsync({ name, email }).then(({ id }) => onClose(id));
  };

  return (
    <Modal
      title="Add Customer"
      onClose={onClose}
      actions={
        <div className="flex gap-2">
          <Button label="Cancel" onClick={() => onClose(null!)} />
          <Button label="Save" onClick={doCreateCustomer} />
        </div>
      }
    >
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          label="Name"
          wrapperClassName="w-full"
        />
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="Email"
          wrapperClassName="w-full"
          type="email"
        />
      </div>
    </Modal>
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
  const [, setDashboardState] = useDashboardState();

  const { data: customers } = api.customer.ac.useQuery(
    { query },
    {
      enabled: query.length >= 0,
    }
  );

  const onClose = (id?: string) => {
    if (id) setSelectedCustomer(id);

    setDashboardState((state) => ({
      ...state,
      modals: state.modals.slice(0, state.modals.length - 1),
    }));
  };

  useEffect(() => {
    if (!selectedCustomer) return;
    if (selectedCustomer === Symbol.for("new")) {
      // open modal
      setDashboardState((state) => ({
        ...state,
        modals: [
          ...state.modals,
          <NewCustomerModals onClose={onClose} key={state.modals.length} />,
        ],
      }));
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
        displayValue={(value: RouterOutputs["service"]["ac"][0]) => value.name}
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
          <Combobox.Option value={Symbol.for("new")} as={Fragment}>
            {({ active, selected }) => (
              <li
                className={cn(
                  "flex w-full items-center gap-2 p-2 capitalize",
                  active ? "bg-slate-100" : ""
                )}
              >
                Add new customer
              </li>
            )}
          </Combobox.Option>
        )}
      </Combobox.Options>
    </Combobox>
  );
};

export const CustomerAvatar: React.FC<{ name: string; className?: string }> = ({
  name,
  className,
}) => {
  const hsl = useSeededHslColor(name, "90%");
  const hslText = useSeededHslColor(name, "30%");
  const [initials] = React.useState(() => {
    const [first, last] = name.split(" ");

    return `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();
  });

  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full",
        className
      )}
      style={{ background: hsl, color: hslText }}
    >
      {initials}
    </div>
  );
};

export const CustomersList: React.FC<{
  customerIds: string[];
  setCustomerIds: React.Dispatch<React.SetStateAction<string[]>>;

  afterNewCustomer?: (customerId: string) => void;
  afterRemoveCustomer?: (customerId: string) => void;
}> = ({
  customerIds,
  setCustomerIds,
  afterNewCustomer,
  afterRemoveCustomer,
}) => {
  const onNewContact = (customerId: string) => {
    setCustomerIds((ids) => [...ids, customerId]);
    afterNewCustomer?.(customerId);
  };

  const onRemoveContact = (customerId: string) => {
    setCustomerIds((ids) => ids.filter((id) => id !== customerId));
    afterRemoveCustomer?.(customerId);
  };

  const customersQuery = api.customer.byIds.useQuery(customerIds, {
    enabled: customerIds.length > 0,
    initialData: [],
  });

  return (
    <>
      <CustomersAutocomplete onSelect={onNewContact} />
      {customersQuery.data?.map((customer) => {
        return (
          <div
            className="mt-2 flex min-w-0 items-center gap-2 overflow-hidden rounded border p-2 text-sm leading-none"
            key={customer?.id}
          >
            <div className="w-fit flex-shrink-0">
              <CustomerAvatar name={customer?.name || ""} />
            </div>
            <div className="relative flex min-w-0 flex-col">
              <strong>{customer?.name}</strong>
              {/* TODO: Fix overflow not using ellipsis. Ideally have a hover expand to show full text */}
              {customer?.email || customer?.phone}
            </div>

            <button
              onClick={() => onRemoveContact(customer.id)}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded text-red-800 hover:bg-red-100"
            >
              <Icons.X></Icons.X>
            </button>
          </div>
        );
      })}
    </>
  );
};

const Customers: NextPage = () => {
  const { data: customers } = useCustomers();
  const [, setDashboardState] = useDashboardState();
  const customerActions = useCustomerActions();
  useSetDashboardTitle("Customers");
  const onClose = () => {
    setDashboardState((state) => ({
      ...state,
      modals: state.modals.slice(0, state.modals.length - 1),
    }));
  };

  const openModal = () => {
    setDashboardState((state) => ({
      ...state,
      modals: [
        ...state.modals,
        <NewCustomerModals onClose={onClose} key={state.modals.length} />,
      ],
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

          <Button
            onClick={() => customerActions.seed.mutate()}
            label="Seed customer"
          />
        </div>
      }
    >
      <div className="h-full w-full overflow-hidden rounded border">
        {customers?.map((customer) => (
          <div className="flex items-center border-b p-2">
            <input type="checkbox" name="" id="" className="mr-2" />
            <CustomerAvatar name={customer.name} />
            <div key={customer.id} className="w-fit px-2">
              <strong className="capitalize leading-none">
                {customer.name}
              </strong>
              <span className="flex items-center gap-1 leading-none">
                <Icons.Envelope className="inline-flex" />
                {customer.email}
              </span>
            </div>

            <div className="ml-auto"></div>
            <div>
              <button className="flex items-center gap-2 border-b p-2 pr-4 font-semibold text-blue-600 last-of-type:border-b-0  hover:bg-slate-100 focus:ring-1 active:ring-2">
                <Icons.Pencil />
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </Dashboard>
  );
};

export default Customers;
