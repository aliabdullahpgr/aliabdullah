import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: pnpm db:make-admin <email>");
    process.exit(1);
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found with email: ${email}`);
    console.error("Sign up at /login first, then re-run this script.");
    process.exit(1);
  }

  if (user.role === "admin") {
    console.log(`✓ ${email} is already an admin.`);
    return;
  }

  const updated = await db.user.update({
    where: { email },
    data: { role: "admin" },
  });

  console.log(`✓ Promoted ${updated.email} (${updated.id}) to admin.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => void db.$disconnect());
