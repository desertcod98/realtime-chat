import getCurrentUser from "@/app/actions/getCurrentUser";
import db from "@/db";
import { chats, members, users } from "@/db/schema";
import { eq, or, and, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextResponse } from "next/server";
import { z } from "zod";

const PostData = z.discriminatedUnion("isGroup", [
  z.object({
    isGroup: z.literal(false),
    userEmail: z.string().min(1),
  }),
  z.object({
    isGroup: z.literal(true),
    groupName: z.string().min(1),
    groupDescription: z
      .union([z.string().length(0), z.string().min(1)])
      .optional()
      .transform((e) => (e === "" ? undefined : e)),
    imgUrl: z
      .union([z.string().length(0), z.string().min(1)])
      .optional()
      .transform((e) => (e === "" ? undefined : e)),
  }),
]);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Forbidden", { status: 403 });

  try {
    const body = await request.json();
    const zodParse = PostData.safeParse(body);
    if (!zodParse.success) {
      console.log(zodParse.error);
      return new NextResponse("Bad request", { status: 400 });
    }

    let newChat;
    if (!zodParse.data.isGroup) {
      const [invitedUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, zodParse.data.userEmail))
        .limit(1);

      if (!invitedUser) {
        return new NextResponse("User not found", { status: 400 });
      }

      //correct query:
      // SELECT c.id
      // FROM chats c
      // INNER JOIN members m1 ON c.id = m1.chat_id
      // INNER JOIN members m2 ON c.id = m2.chat_id
      // WHERE m1.user_id = 1 AND m2.user_id = 2 AND c.is_group = false;

      const m1 = alias(members, "m1");
      const m2 = alias(members, "m2");

      const existingChat = await db
        .select({ id: chats.id })
        .from(chats)
        .innerJoin(m1, eq(chats.id, m1.chatId))
        .innerJoin(m2, eq(chats.id, m2.chatId))
        .where(
          and(
            eq(m1.userId, user.id),
            eq(m2.userId, invitedUser.id),
            eq(chats.isGroup, false)
          )
        );

      if (existingChat.length > 0) {
        return new NextResponse("Chat already exists", { status: 400 });
      }

      [newChat] = await db
        .insert(chats)
        .values({ created_at: chats.created_at.default })
        .returning();

      await db.insert(members).values([
        { chatId: newChat.id, userId: user.id },
        { chatId: newChat.id, userId: invitedUser.id },
      ]);
    } else {
      [newChat] = await db
        .insert(chats)
        .values({
          isGroup: true,
          image: zodParse.data.imgUrl,
          name: zodParse.data.groupName,
          description: zodParse.data.groupDescription,
        })
        .returning();
        await db.insert(members).values(
          { chatId: newChat.id, userId: user.id },
        );
    }

    return NextResponse.json(newChat);
  } catch (error: any) {
    console.log(error, "CHAT_CREATION_ERROR");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
