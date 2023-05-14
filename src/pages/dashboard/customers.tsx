import { UserButton } from "@clerk/nextjs";
import { atom, useAtom } from "jotai";
import { NextPage } from "next";
import React, { Children, useEffect } from "react";
import { Button, Input, Modal, Textarea } from "~/components/base";
import {
  Dashboard,
  TheDashboardSidebar,
  useDashboardState,
  useSetDashboardTitle,
} from "~/layouts/Dashboard";
import { RouterInputs, api } from "~/utils/api";
import { cn } from "~/utils/cn";
import { Icons } from "~/utils/icons";

export const useCustomerActions = () => {
  const create = api.customer.create.useMutation();
  const addToInvoice = api.customer.addToInvoice.useMutation();

  return {
    create,
    addToInvoice,
  };
};
type CreateCustomer = RouterInputs["customer"]["create"];

export const NewCustomerModals: React.FC<{}> = ({}) => {
  const [, setDashboardState] = useDashboardState();
  const { create } = useCustomerActions();

  const [name, setName] = React.useState<CreateCustomer["name"]>("");
  const [email, setEmail] = React.useState<CreateCustomer["email"]>("");

  const onClose = () => {
    setDashboardState((state) => ({
      ...state,
      modals: state.modals.slice(0, state.modals.length - 1),
    }));
  };

  const doCreateCustomer = () => {
    create.mutateAsync({ name, email }).then(() => onClose());
  };

  return (
    <Modal
      title="Add Customer"
      onClose={onClose}
      actions={
        <div className="flex gap-2">
          <Button label="Cancel" onClick={onClose} />
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

const useCustomers = () => api.customer.list.useQuery(undefined);

const useSeededHslColor = (seed: string, l = "20%") => {
  const hsl = React.useMemo(() => {
    let hash = 0;
    for (var i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    let h = hash % 360;
    return `hsl(${h}, 100%, ${l})`; //"hsl(" + h + ", " + s + "%, " + l + "%)";
  }, [seed]);

  return hsl;
};

export const CustomerAvatar: React.FC<{ name: string }> = ({ name }) => {
  const hsl = useSeededHslColor(name, "90%");
  const hslText = useSeededHslColor(name, "30%");
  const [initials] = React.useState(() => {
    const [first, last] = name.split(" ");

    return `${first?.[0]}${last?.[0]}`.toUpperCase();
  });

  return (
    <div
      className="flex h-8 w-8 items-center justify-center rounded-full"
      style={{ background: hsl, color: hslText }}
    >
      {initials}
    </div>
  );
};

const Customers: NextPage = () => {
  const { data: customers } = useCustomers();
  const [, setDashboardState] = useDashboardState();
  useSetDashboardTitle("Customers");

  //   useEffect(() => {
  //     setDashboardState((state) => ({ ...state, title: "Customers" }));
  //   }, []);

  const openModal = () => {
    setDashboardState((state) => ({
      ...state,
      modals: [
        ...state.modals,
        <NewCustomerModals key={state.modals.length} />,
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
