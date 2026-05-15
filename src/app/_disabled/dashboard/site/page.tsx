import { redirect } from "next/navigation";
import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import SiteConfigEditor from "./_components/site-config-editor";

export default async function SiteContentPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return <SiteConfigEditor />;
}
