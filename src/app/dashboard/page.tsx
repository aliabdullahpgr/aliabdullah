import { redirect } from "next/navigation";
import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import DashboardOverview from "./_components/dashboard-overview";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return <DashboardOverview />;
}
