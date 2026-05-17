// Seeds (or resets) the single admin user. Email/password signup is disabled
// in better-auth, so this script writes directly to the User + Account tables
// using better-auth's password hashing.
//
// Run:  pnpm db:seed-admin
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "node:crypto";

const ADMIN_EMAIL = "ilabhaia1234@gmail.com";
const ADMIN_PASSWORD = "ali238003676";
const ADMIN_NAME = "Ali Abdullah";

const db = new PrismaClient();

async function main() {
  const hash = await hashPassword(ADMIN_PASSWORD);

  const existing = await db.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    // Reset password, role, and name (idempotent).
    await db.user.update({
      where: { id: existing.id },
      data: { name: ADMIN_NAME, role: "admin", emailVerified: true },
    });

    const credentialAccount = await db.account.findFirst({
      where: { userId: existing.id, providerId: "credential" },
    });

    if (credentialAccount) {
      await db.account.update({
        where: { id: credentialAccount.id },
        data: { password: hash },
      });
    } else {
      await db.account.create({
        data: {
          id: randomUUID(),
          userId: existing.id,
          accountId: existing.id,
          providerId: "credential",
          password: hash,
        },
      });
    }

    console.log(`✓ Reset admin: ${ADMIN_EMAIL} (role=admin)`);
    return;
  }

  const userId = randomUUID();
  await db.user.create({
    data: {
      id: userId,
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      emailVerified: true,
      role: "admin",
    },
  });

  await db.account.create({
    data: {
      id: randomUUID(),
      userId,
      accountId: userId,
      providerId: "credential",
      password: hash,
    },
  });

  console.log(`✓ Created admin: ${ADMIN_EMAIL} (role=admin)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => void db.$disconnect());
