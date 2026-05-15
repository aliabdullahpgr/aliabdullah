import { redirect } from "next/navigation";
import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import PostsTable from "./_components/posts-table";

export default async function PostsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Legacy Posts
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          View legacy blog posts from the old system
        </p>
      </div>
      <PostsTable />
    </div>
  );
}
