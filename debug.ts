import { prisma } from "./src/lib/prisma";

async function check() {
  const count = await prisma.ticket.count();
  console.log("Total tickets:", count);
  const tickets = await prisma.ticket.findMany({
    take: 5,
    include: { requester: true }
  });
  console.log("Sample tickets:", JSON.stringify(tickets, null, 2));
}

check().catch(console.error);
