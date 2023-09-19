import getCurrentUser from "@/app/actions/getCurrentUser";
import db from "@/db";
import { chats, members, users } from "@/db/schema";
import { pusherServer } from "@/lib/pusher";
import { eq, or, and, sql, placeholder, ne } from "drizzle-orm";
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

const pInvitedUser = db
  .select({ id: users.id })
  .from(users)
  .where(eq(users.email, placeholder("email")))
  .limit(1)
  .prepare("p_invited_user");

const m1 = alias(members, "m1");
const m2 = alias(members, "m2");

const pExistingChat = db
  .select({ id: chats.id })
  .from(chats)
  .innerJoin(m1, eq(chats.id, m1.chatId))
  .innerJoin(m2, eq(chats.id, m2.chatId))
  .where(
    and(
      eq(m1.userId, placeholder("userId")),
      eq(m2.userId, placeholder("invitedUserId")),
      eq(chats.isGroup, false)
    )
  )
  .prepare("p_existing_chat");

const pNewMembers = db
  .insert(members)
  .values([
    { chatId: placeholder("newChatId"), userId: placeholder("userId") },
    { chatId: placeholder("newChatId"), userId: placeholder("invitedUserId") },
  ])
  .prepare("p_new_members");

const pNewChat = db
  .insert(chats)
  .values({ created_at: chats.created_at.default })
  .returning()
  .prepare("p_new_chat");

const pNewGroupChat = db
  .insert(chats)
  .values({
    isGroup: true,
    image: placeholder("imgUrl"),
    name: placeholder("groupName"),
    description: placeholder("groupDescription"),
  })
  .returning()
  .prepare("p_new_group_chat");

const pNewGroupMember = db
  .insert(members)
  .values({
    chatId: placeholder("newChatId"),
    userId: placeholder("userId"),
    isAdministrator: true,
  })
  .prepare("p_new_group_member");

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
      const [invitedUser] = await pInvitedUser.execute({
        email: zodParse.data.userEmail,
      });

      if (!invitedUser) {
        return new NextResponse("User not found", { status: 400 });
      }

      //correct query:
      // SELECT c.id
      // FROM chats c
      // INNER JOIN members m1 ON c.id = m1.chat_id
      // INNER JOIN members m2 ON c.id = m2.chat_id
      // WHERE m1.user_id = 1 AND m2.user_id = 2 AND c.is_group = false;

      // const m1 = alias(members, "m1");
      // const m2 = alias(members, "m2");

      const existingChat = await pExistingChat.execute({
        userId: user.id,
        invitedUserId: invitedUser.id,
      });

      if (existingChat.length > 0) {
        return new NextResponse("Chat already exists", { status: 400 });
      }

      [newChat] = await pNewChat.execute();

      await pNewMembers.execute({
        newChatId: newChat.id,
        userId: user.id,
        invitedUserId: invitedUser.id,
      });

      const fullChat = await db.query.members.findFirst({
        with: {
          chat: {
            with: {
              members: {
                with: {
                  user: {
                    columns: {
                      name: true,
                      image: true,
                    },
                  },
                },
                where: ne(members.userId, invitedUser.id),
              },
            },
          },
        },
        where: eq(members.chatId, newChat.id),
      });

      if(!fullChat) return new NextResponse("Internal Error", { status: 500 })

      await pusherServer.trigger(`chats=${invitedUser.id}`, "chats=new", fullChat);

    } else {
      [newChat] = await pNewGroupChat.execute({
        imgUrl: zodParse.data.imgUrl ?? null,
        groupName: zodParse.data.groupName ?? null,
        groupDescription: zodParse.data.groupDescription ?? null,
      });
      await pNewGroupMember.execute({ newChatId: newChat.id, userId: user.id });
    }

    return NextResponse.json(newChat);
  } catch (error: any) {
    console.log(error, "CHAT_CREATION_ERROR");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
