import { prisma } from "./src/lib/prisma";

async function check() {
  const users = await prisma.user.findMany({
    select: { email: true, name: true, role: true }
  });
  console.log("Users:", JSON.stringify(users, null, 2));
}

check().catch(console.error);
