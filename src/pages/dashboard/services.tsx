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
import { useServiceActions } from "..";

type CreateService = RouterInputs["example"]["createService"];


// export const

export const NewServiceModals: React.FC<{}> = ({}) => {
  const [, setDashboardState] = useDashboardState();
  const { createService } = useServiceActions();

  const [name, setName] = React.useState<CreateService["name"]>("");
  const [description, setDescription] =
    React.useState<CreateService["description"]>("");
  const [price, setPrice] = React.useState<CreateService["price"]>(0);
  const [chilldren, setChildren] = React.useState<CreateService["children"]>(
    []
  );

  const onClose = () => {
    setDashboardState((state) => ({
      ...state,
      modals: state.modals.slice(0, state.modals.length - 1),
    }));
  };

  const doCreateService = () => {
    const filtered = chilldren.filter((child) => child.name && child.price);

    createService({ name, description, price, children: filtered });
  };

  return (
    <Modal
      title="Add Service"
      onClose={onClose}
      actions={
        <div className="flex gap-2">
          <Button label="Cancel" onClick={onClose} />
          <Button label="Save" onClick={doCreateService} />
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
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.valueAsNumber)}
          label="Price"
          wrapperClassName="w-24 flex-shrink-0"
        />
      </div>

      <Textarea
        label="Description"
        value={description}
        rows={5}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="mt-4 flex justify-between">
        <strong>Additional charges</strong>
        <Button
          icon={<Icons.Plus className="text-black" />}
          label="Add charge"
          onClick={() => {
            setChildren((children) => [
              ...children,
              { name: "", description: "", price: 0 },
            ]);
          }}
        />
      </div>
      <div className="grid max-h-full min-h-[10rem] grid-cols-3 gap-2 overflow-y-hidden">
        {chilldren.map((child, i) => (
          <div key={i}>
            <div className="mb-2 flex gap-2">
              <Input
                wrapperClassName="w-full"
                value={child.name}
                onChange={(e) => {
                  setChildren((children) => {
                    const newChildren = [...children];
                    newChildren[i]!.name = e.target.value;
                    return newChildren;
                  });
                }}
                label={"Name"}
              />
              <Input
                value={child.price}
                onChange={(e) => {
                  setChildren((children) => {
                    const newChildren = [...children];
                    newChildren[i]!.price = e.target.valueAsNumber;
                    return newChildren;
                  });
                }}
                wrapperClassName="w-40"
                label="Price"
                type="number"
              />
              <button
                className={cn(
                  "mt-6",
                  "flex aspect-square flex-shrink-0 items-center justify-center rounded p-2 hover:bg-slate-100"
                )}
                onClick={() => {
                  setChildren((children) => {
                    const newChildren = [...children];
                    newChildren.splice(i, 1);
                    return newChildren;
                  });
                }}
              >
                <Icons.Trash />
              </button>
            </div>

            <Textarea
              value={child.description}
              onChange={(e) => {
                setChildren((children) => {
                  const newChildren = [...children];
                  newChildren[i]!.description = e.target.value;
                  return newChildren;
                });
              }}
              rows={5}
              placeholder="Description"
              label=""
            />
          </div>
        ))}
      </div>
    </Modal>
  );
};

const useServices = () => api.example.services.useQuery(undefined);

const Services: NextPage = () => {
  const { data: services } = useServices();
  const [, setDashboardState] = useDashboardState();
  useSetDashboardTitle("Services");

  //   useEffect(() => {
  //     setDashboardState((state) => ({ ...state, title: "Services" }));
  //   }, []);

  const openModal = () => {
    setDashboardState((state) => ({
      ...state,
      modals: [...state.modals, <NewServiceModals key={state.modals.length} />],
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
        {services?.map((service) => (
          <div>
            <div className="flex items-center border-b">
              <div key={service.id} className="w-fit p-2">
                <div className="flex w-fit items-center gap-2">
                  <input type="checkbox" name="" id="" />
                  <strong>{service.name}</strong>
                </div>
                <p>{service.description}</p>
              </div>

              <div className="ml-auto"></div>
              <div className="mr-8">
                {service.price.toLocaleString("en-US", {
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
            <div className="border-b bg-neutral-100 pl-4">
              {service?.children.map((child) => (
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
                    {service.price.toLocaleString("en-US", {
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
            </div>
          </div>
        ))}
      </div>
    </Dashboard>
  );
};

export default Services;
