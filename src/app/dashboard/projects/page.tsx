import { redirect } from "next/navigation";
import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import ProjectsManager from "./_components/projects-manager";

export default async function ProjectsDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return <ProjectsManager />;
}
