import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { Priority } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";

// Get tickets
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const showOnlyMyTickets = searchParams.get('my') === 'true';

    const userEmail = session.user.email?.toLowerCase().trim();
    if (!userEmail) {
      return NextResponse.json({ error: "User email not found in session" }, { status: 400 });
    }

    // Define where clause if only my tickets are requested
    const where = showOnlyMyTickets ? {
      requester: {
        email: userEmail
      }
    } : {};

    console.log(`[DEBUG] Querying tickets (myOnly=${showOnlyMyTickets}) for user: ${userEmail}`);

    const tickets = await prisma.ticket.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Fetch Tickets Error:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

// Create a new ticket
export async function POST(req: Request) {
  try {
    const session = await getSession();
    const formData = await req.formData();
    const brand = formData.get('brand') as string;
    const requester = formData.get('requester') as string;
    const subject = formData.get('subject') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as string;
    const files = formData.getAll('files') as File[];

    const sanitizedRequester = requester.toLowerCase().trim();

    // 1. Create or Find Brand
    const brandRecord = await prisma.brand.upsert({
      where: { name: brand },
      update: {},
      create: { name: brand },
    });

    // 2. Create or Find Requester
    const requesterRecord = await prisma.requester.upsert({
      where: { email: sanitizedRequester },
      update: {},
      create: { email: sanitizedRequester, name: sanitizedRequester.split('@')[0] },
    });

    // 3. Create Ticket
    const ticket = await prisma.ticket.create({
      data: {
        subject,
        description,
        priority: priority.toUpperCase() as Priority,
        brandId: brandRecord.id,
        requesterId: requesterRecord.id,
      },
    });

    // 4. Handle Attachments if any
    if (files && files.length > 0) {
      for (const file of files) {
        if (typeof file === 'string' || !file.name) continue;
        
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
          const filename = `${Date.now()}-${safeName}`;
          const relativePath = `/uploads/${filename}`;
          const absolutePath = path.join(process.cwd(), "public", "uploads", filename);
          
          await writeFile(absolutePath, buffer);

          await prisma.attachment.create({
            data: {
              ticketId: ticket.id,
              fileName: file.name,
              fileUrl: relativePath,
            },
          });
        } catch (fileError) {
          console.error("Error saving file:", file.name, fileError);
        }
      }
    }

    // 5. Build dynamic email
    const emailHtml = `
      <div style="font-family: sans-serif;">
        <p>Hello ${requesterRecord.name || requesterRecord.email},</p>
        <p>We have received your support request and the ticket <strong>#${ticket.id}</strong> has been created. An agent from our ${brandRecord.name} team will be responding soon.</p>
        <p>In the meantime, you can provide an update if required by replying to this email.</p>
        <br/>
        <p>Thanks,</p>
        <p>The ${brandRecord.name} Team</p>
      </div>
    `;

    // 6. Send Email
    try {
      await sendEmail(
        requesterRecord.email,
        `Ticket created - #${ticket.id} - ${subject}`,
        emailHtml,
        {
          fromName: session?.user?.name || undefined,
          fromEmail: session?.user?.email || undefined
        }
      );
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
    }

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
    });

  } catch (error) {
    console.error("Ticket Creation Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
