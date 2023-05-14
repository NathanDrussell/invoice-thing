import { NextPage } from "next";
import { Dashboard, TheDashboardSidebar } from "~/layouts/Dashboard";

const NotFound: NextPage = () => {
  return (
    <Dashboard sidebar={<TheDashboardSidebar />} actions={null}>
      <div className="flex h-full flex-col items-center mt-8">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-xl">Page not found</p>
      </div>
    </Dashboard>
  );
};

export default NotFound;