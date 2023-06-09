import {
  CreateOrganization,
  OrganizationProfile,
  UserButton,
  useOrganization,
} from "@clerk/nextjs";
import { atom, useAtom } from "jotai";
import Link from "next/link";
import React, { useEffect } from "react";
import { Input, Modal } from "~/components/base";
import { RouterInputs, api } from "~/utils/api";
import { Icons } from "~/utils/icons";

const dashboardAtom = atom({
  title: "",
  showOrg: false,
  modals: [] as React.ReactNode[],
});

export const useDashboardState = () => useAtom(dashboardAtom);

export const TheDashboardSidebar = () => {
  const [, setDashboardState] = useDashboardState();
  return (
    <>
      <Link
        href="/dashboard/projects"
        className="flex items-center gap-2 border-b p-2 last:border-b-0 hover:bg-slate-100 focus:ring-1 active:ring-2"
      >
        <Icons.BookOpen />
        Projects
      </Link>
      <Link
        href="/dashboard/customers"
        className="flex items-center gap-2 border-b p-2 last:border-b-0 hover:bg-slate-100 focus:ring-1 active:ring-2"
      >
        <Icons.UsersThree />
        Customers
      </Link>
      <Link
        href="/dashboard/services"
        className="flex items-center gap-2 border-b p-2 last:border-b-0  hover:bg-slate-100 focus:ring-1 active:ring-2"
      >
        <Icons.Handshake />
        Services
      </Link>
      <Link
        href="/dashboard/invoices"
        className="flex items-center gap-2 border-b p-2 last:border-b-0 hover:bg-slate-100 focus:ring-1 active:ring-2"
      >
        <Icons.Files />
        Invoices
      </Link>
      <button
        className="flex items-center gap-2 border-b p-2 last:border-b-0 hover:bg-slate-100 focus:ring-1 active:ring-2"
        onClick={() => {
          setDashboardState((state) => ({ ...state, showOrg: true }));
        }}
      >
        <Icons.Buildings />
        Organization
      </button>
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

const ClerkModal = ({ children, onClose }: any) => {
  useEffect(() => {
    const escListener = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };

    document.addEventListener("keydown", escListener);

    return () => {
      document.removeEventListener("keydown", escListener);
    };
  }, []);
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/40 pt-16 backdrop-blur-sm">
      <div className="relative z-50">{children}</div>
    </div>
  );
};

export const Dashboard: React.FC<{
  children: React.ReactNode;
  sidebar: React.ReactNode;
  actions: React.ReactNode;
}> = ({ children, sidebar, actions }) => {
  const [dashboardState, setDashboardState] = useDashboardState();
  const { organization, isLoaded } = useOrganization();

  return (
    <div className="flex h-screen flex-col">
      {isLoaded && !organization && (
        <ClerkModal>
          <CreateOrganization afterCreateOrganizationUrl="/dashboard/customers" />
        </ClerkModal>
      )}
      {dashboardState.showOrg ? (
        <ClerkModal
          onClose={() =>
            setDashboardState((state) => ({ ...state, showOrg: false }))
          }
        >
          <OrganizationProfile />
        </ClerkModal>
      ) : null}
      <header className="sticky top-0 bg-black text-white">
        <div className="container mx-auto flex h-16 items-center">
          <h1 className="text-xl uppercase">invoicething</h1>
          <span className="ml-1 rounded bg-blue-600 p-1 text-xs font-bold leading-none">
            ALPHA
          </span>
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
