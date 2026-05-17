import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "~/server/better-auth";
import ProjectEditor from "../_components/project-editor";

export default async function NewProjectPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return <ProjectEditor />;
}
