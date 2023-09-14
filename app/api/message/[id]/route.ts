import getCurrentUser from "@/app/actions/getCurrentUser";
import db from "@/db";
import { chats, members, messages, users } from "@/db/schema";
import { pusherServer } from "@/lib/pusher";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();

  if (!user) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const messageId: number = +params.id;
  if (Number.isNaN(messageId)) {
    return new NextResponse("Bad request", { status: 400 });
  }

  try {
    const [messageData] = await db
      .select({ userId: members.userId, chatId: chats.id, id: messages.id })
      .from(messages)
      .innerJoin(chats, eq(messages.chatId, chats.id))
      .innerJoin(members, eq(messages.memberId, members.id))
      .where(eq(messages.id, messageId));

    if (!messageData) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const [deletedMessage] = await db.delete(messages).where(eq(messages.id, messageId)).returning();

    const channelName = `chat=${messageData.chatId}`;

    await pusherServer.trigger(channelName, "message=deleted", {messageId: messageData.id});

    return NextResponse.json(deletedMessage);
  } catch (error: any) {
    console.log(error, "DELETE_MESSAGE_ERROR");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
