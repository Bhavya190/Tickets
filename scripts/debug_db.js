const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  const tickets = await prisma.ticket.findMany({
    include: {
      requester: true
    }
  });

  console.log('--- USERS ---');
  users.forEach(u => console.log(`${u.email} - ${u.role}`));
  
  console.log('\n--- TICKETS ---');
  tickets.forEach(t => console.log(`${t.subject} - Requester: ${t.requester.email}`));

  await prisma.$disconnect();
}

main().catch(console.error);
