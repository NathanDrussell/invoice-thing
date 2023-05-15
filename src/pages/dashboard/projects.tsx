import { formatRelative } from "date-fns";
import { atom, useAtom } from "jotai";
import { NextPage } from "next";
import React, { SetStateAction, useEffect } from "react";
import { Badge, Button, Color, Input, Modal } from "~/components/base";
import {
  Dashboard,
  TheDashboardSidebar,
  useDashboardState,
  useSetDashboardTitle,
} from "~/layouts/Dashboard";
import { RouterInputs, RouterOutputs, api } from "~/utils/api";
import { Icons } from "~/utils/icons";
import {
  CustomerAvatar,
  CustomersAutocomplete,
  CustomersList,
} from "./customers";
import { ServicesAutocomplete, ServicesList } from "./services";

type CreateProject = RouterInputs["project"]["create"];
type Project = RouterOutputs["project"]["list"][0];

const projectPageState = atom({
  selectedIds: [] as string[],
});

const useProjectPageState = () => {
  const [pageState, setPageState] = useAtom(projectPageState);

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

const useProjects = () => api.project.list.useQuery(undefined);

export const useProjectActions = () => {
  const create = api.project.create.useMutation();
  // const addCustomer = api.project.addCustomer.useMutation();
  // const addService = api.project.addService.useMutation();

  // const send = api.project.send.useMutation();
  // const pay = api.project.pay.useMutation();
  // const cancel = api.project.cancel.useMutation();
  // const del = api.project.delete.useMutation();

  return {
    create,
    // addCustomer,
    // addService,
    // send,
    // pay,
    // cancel,
    // delete: del,
  };
};

export const NewProjectModal: React.FC<{ seed?: Project }> = ({ seed }) => {
  const [, setDashboardState] = useDashboardState();
  const projectActions = useProjectActions();

  const [name, setName] = React.useState<CreateProject["name"]>(
    seed?.name || ""
  );
  const [serviceIds, setServiceIds] = React.useState<
    CreateProject["serviceIds"]
  >(seed?.services.map((s) => s.serviceId) || []);

  const [customerIds, setCustomerIds] = React.useState<
    CreateProject["customerIds"]
  >(seed?.customers.map((c) => c.customer!.id) || []);

  const onClose = () => {
    setDashboardState((state) => ({
      ...state,
      modals: state.modals.slice(0, state.modals.length - 1),
    }));
  };

  const doCreateProject = () => {
    projectActions.create.mutateAsync({
      name,
      customerIds,
      serviceIds: serviceIds.filter(Boolean),
    });
  };

  const afterNewCustomer = (customerId: string) => {
    if (!seed) return;

    // projectActions.addCustomer.mutateAsync({
    //   projectId: seed.id,
    //   customerId,
    // });
  };

  const afterNewService = (serviceId: string) => {
    if (!seed) return;

    // projectActions.addService.mutateAsync({
    //   projectId: seed.id,
    //   serviceId,
    // });
  };

  return (
    <Modal
      title="Add Service"
      onClose={onClose}
      actions={
        <div className="flex gap-2">
          {!seed && (
            <>
              <Button label="Cancel" onClick={onClose} />
              <Button label="Save" onClick={doCreateProject} />
            </>
          )}
        </div>
      }
    >
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value!)}
          label="Due date"
          wrapperClassName="w-full"
        />
      </div>

      <div className="mt-2 flex gap-4">
        <div className="w-64 flex-shrink-0">
          <strong className="text-xs">Customers</strong>
          <CustomersList
            customerIds={customerIds}
            setCustomerIds={setCustomerIds}
            afterNewCustomer={afterNewCustomer}
          />
        </div>

        <div className="w-full">
          <strong className="text-xs">Services</strong>

          <ServicesList
            serviceIds={serviceIds}
            setServiceIds={setServiceIds}
            afterNewService={afterNewService}
          />
        </div>
      </div>
      {/* <Textarea
        label="Description"
        value={description}
        rows={5}
        onChange={(e) => setDescription(e.target.value)}
      /> */}
    </Modal>
  );
};

const useProjectModal = () => {
  const [, setDashboardState] = useDashboardState();

  const openModal = (seed?: Project) => {
    setDashboardState((state) => ({
      ...state,
      modals: [
        ...state.modals,
        <NewProjectModal seed={seed} key={state.modals.length} />,
      ],
    }));
  };

  return openModal;
};

const Projects: NextPage = () => {
  const { data: projects } = useProjects();
  const [, setDashboardState] = useDashboardState();
  const projectActions = useProjectActions();
  useSetDashboardTitle("Projects");
  const ps = useProjectPageState();
  const openModal = useProjectModal();

  //   useEffect(() => {
  //     setDashboardState((state) => ({ ...state, title: "Projects" }));
  //   }, []);

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
          {/* <Button
            disabled={ps.selectedIds.length === 0}
            onClick={() => {
              ps.selectedIds.forEach((projectId: string) => {
                projectActions.send.mutateAsync({ projectId });
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
          /> */}
        </div>
      }
    >
      <div className="h-full w-full overflow-hidden rounded border">
        {projects?.map((project) => {
          return (
            <div key={project.id} onClick={() => ps.toggle(project.id)}>
              <div className="flex border-b">
                <div className="flex w-fit gap-2 p-2">
                  <div className="flex w-fit items-center gap-2">
                    <input
                      type="checkbox"
                      checked={ps.selectedIds.includes(project.id)}
                      onChange={() =>
                        setDashboardState((state) => ({ ...state }))
                      }
                      name=""
                      id=""
                    />
                    <div className="flex w-20 items-center -space-x-4">
                      {/* {JSON.stringify(project.customers)} */}
                      {project.customers.map(({ customer }, i) => (
                        <CustomerAvatar
                          className="flex-shrink-0 shadow-sm ring-2 ring-neutral-50"
                          key={customer?.id || i}
                          name={customer?.name || ""}
                        />
                      ))}
                    </div>
                    <strong>{project.id}</strong>
                  </div>
                  {/* {project.status === "sent" && (
                    <Badge
                      color={+project.dueDate < +new Date() ? "red" : "gray"}
                    >
                      due{" "}
                      {
                        // project.dueDate.toLocaleString("en-US", {
                        //   numberingSystem: ""
                        // })
                        formatRelative(project.dueDate, new Date())
                      }
                    </Badge>
                  )} */}
                </div>
                <div className="ml-auto"></div>
                <div className="mr-8 flex max-w-md flex-wrap items-center gap-1 py-2 text-xs">
                  {project.services
                    ?.map((item) => item.service.name)
                    .map((name) => (
                      <div className="rounded border p-1 capitalize leading-none">
                        {name}
                      </div>
                    ))}
                </div>
                <div className="mr-8 flex items-center gap-2">
                  {/* {project.total.toLocaleString("en-US", {
                    style: "currency",
                    currency: "CAD",
                    //   compactDisplay: "short",
                    currencyDisplay: "symbol",
                  })} */}
                  {/* {project.status === "sent" && project.dueDate < new Date() ? (
                    <Badge color="red">
                      <Icons.Warning className="mr-1" />
                      overdue
                    </Badge>
                  ) : (
                    <Badge color={statusColors[project.status]}>
                      {project.status}
                    </Badge>
                  )} */}
                </div>
                <button
                  onClick={() => openModal(project)}
                  className="flex items-center gap-2 border-b p-2 pr-4 font-semibold text-blue-600 last-of-type:border-b-0  hover:bg-slate-100 focus:ring-1 active:ring-2"
                >
                  <Icons.Pencil />
                  Edit
                </button>
              </div>
              {/* <div className="border-b bg-neutral-100 pl-4">
              {project?.children.map((child) => (
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
                    {project.price.toLocaleString("en-US", {
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

export default Projects;
