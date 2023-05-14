import { UserButton } from "@clerk/nextjs";
import { atom, useAtom } from "jotai";
import Link from "next/link";
import { useEffect } from "react";
import { Icons } from "~/utils/icons";

const dashboardAtom = atom({
  title: "",
  modals: [] as React.ReactNode[],
});

export const useDashboardState = () => useAtom(dashboardAtom);

export const TheDashboardSidebar = () => {
  return (
    <>
      <Link
        href="/dashboard/services"
        className="flex items-center gap-2 border-b p-2 last-of-type:border-b-0  hover:bg-slate-100 focus:ring-1 active:ring-2"
      >
        <Icons.Handshake />
        Services
      </Link>
      <Link
        href="/dashboard/invoices"
        className="flex items-center gap-2 border-b p-2 last-of-type:border-b-0 hover:bg-slate-100 focus:ring-1 active:ring-2"
      >
        <Icons.Files />
        Invoices
      </Link>
      <Link
        href="/dashboard/customers"
        className="flex items-center gap-2 border-b p-2 last-of-type:border-b-0 hover:bg-slate-100 focus:ring-1 active:ring-2"
      >
        <Icons.UsersThree />
        Customers
      </Link>
    </>
  );
};

export const useSetDashboardTitle = (title: string) => {
  const [, setDashboardState] = useDashboardState();

  useEffect(() => {
    document.title = `${title} - invoicething`;
    setDashboardState((state) => ({ ...state, title }));
  }, []);
};

export const Dashboard: React.FC<{
  children: React.ReactNode;
  sidebar: React.ReactNode;
  actions: React.ReactNode;
}> = ({ children, sidebar, actions }) => {
  const [dashboardState, setDashboardState] = useDashboardState();

  return (
    <div className="flex h-screen flex-col">
      <header className="sticky top-0 bg-black text-white">
        <div className="container mx-auto flex h-16 items-center">
          <h1 className="text-xl uppercase">invoicething</h1>

          <div className="ml-auto">
            <UserButton />
          </div>
        </div>
      </header>
      {dashboardState.modals}
      <div className="container mx-auto flex h-full w-full ">
        <menu className="w-80 p-4">
          <div className="sticky top-20 flex flex-col rounded border">
            {sidebar}
          </div>
        </menu>
        <main className="max-h-full w-full py-2">
          <div className="mb-2 flex items-center">
            <h1 className="text-xl font-bold">
              {/*Dashboard -*/}
              {dashboardState.title}
            </h1>

            {actions}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
};
