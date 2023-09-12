import getCurrentUser from "@/app/actions/getCurrentUser";
import db from "@/db";
import { chats, invites, members, users } from "@/db/schema";
import { pusherServer } from "@/lib/pusher";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const ChatId = z.string().uuid();
const PostData = z.object({
  userEmail: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  const user = await getCurrentUser();

  if (!user) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const body = await request.json();
    const zodParse = PostData.safeParse(body);

    const chatId = ChatId.safeParse(params.chatId);

    if (!zodParse.success || !chatId.success) {
      return new NextResponse("Bad request", { status: 400 });
    }

    const [chat] = await db
      .select()
      .from(chats)
      .innerJoin(members, eq(members.chatId, chats.id))
      .where(
        and(eq(members.isAdministrator, true), eq(members.userId, user.id))
      );

    if (!chat ) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const [invitedUser] = await db.select().from(users).where(eq(users.email, zodParse.data.userEmail));

    if(!invitedUser){
      return new NextResponse("User not found", { status: 400 });
    }

    const [existingMember] = await db.select().from(members).where(and(eq(members.chatId, chat.chats.id), eq(members.userId, invitedUser.id)));
    if(existingMember) {
      return new NextResponse("User already in chat", { status: 400 });
    }

    const [invite] = await db.insert(invites).values({
      inviterId: chat.members.id,
      invitedId: invitedUser.id,
    }).returning({id: invites.id});

    const [fullInvite] = await db
      .select({
        id: invites.id,
        inviterId: invites.inviterId,
        inviterImage: users.image,
        inviterName: users.name,
        expiresAt: invites.expiresAt
      })
      .from(invites)
      .innerJoin(members, eq(invites.inviterId, members.id))
      .innerJoin(users, eq(members.userId, users.id))
      .where(eq(invites.id, invite.id));

    await pusherServer.trigger(`notifications=${invitedUser.id}`, "notification=new", fullInvite);

    return NextResponse.json(invite);
  } catch (error: any) {
    console.log(error, "INVITE_MEMBER_ERROR");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
