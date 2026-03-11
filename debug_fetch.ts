import { prisma } from "./src/lib/prisma";

async function check() {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        brand: true,
        requester: true,
        attachments: true,
        comments: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      take: 2
    });
    console.log("Success! Fetched tickets:", tickets.length);
    console.log("First ticket comments:", JSON.stringify(tickets[0]?.comments || [], null, 2));
  } catch (err) {
    console.error("FAILED to fetch tickets:", err);
  }
}

check().catch(console.error);
