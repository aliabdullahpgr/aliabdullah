import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "~/server/better-auth";
import ProjectEditor from "../../_components/project-editor";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  return <ProjectEditor projectId={id} />;
}
