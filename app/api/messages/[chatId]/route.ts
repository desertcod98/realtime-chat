import getCurrentUser from "@/app/actions/getCurrentUser";
import db from "@/db";
import { members, messages, users } from "@/db/schema";
import { pusherServer } from "@/lib/pusher";
import { and, desc, eq, lt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const messages_batch = 17;

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  const { searchParams } = new URL(request.url);
  const cursorParam = searchParams.get("cursor");

  const user = await getCurrentUser();

  if (!user) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  let member = undefined;
  let cursor: number | undefined = undefined;

  if (cursorParam) {
    cursor = +cursorParam;
    if (Number.isNaN(cursor)) {
      return new NextResponse("Bad request", { status: 400 });
    }
  }

  try {
    member = await db.query.members.findFirst({
      with: {
        chat: {
          columns: {
            id: true,
          },
          with: {
            messages: {
              where: cursor ? lt(messages.id, cursor) : undefined,
              limit: messages_batch,
              orderBy: desc(messages.id),
              with: {
                member: {
                  columns: {
                    id: true,
                  },
                  with: {
                    user: {
                      columns: {
                        name: true,
                        image: true,
                      },
                    },
                  },
                },
                seenMessages: {
                  columns: {
                    createdAt: true,
                  },
                  with: {
                    member: {
                      columns: {
                        id: true,
                      },
                      with: {
                        user: {
                          columns: {
                            name: true,
                            image: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      where: and(
        eq(members.chatId, params.chatId),
        eq(members.userId, user.id)
      ),
    });
  } catch (e) {
    return new NextResponse("Bad request", { status: 400 });
  }

  if (!member) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    let nextCursor = null;

    if (member.chat.messages.length === messages_batch) {
      nextCursor = member.chat.messages[messages_batch - 1].id;
    }

    return NextResponse.json({ items: member.chat.messages, nextCursor });
  } catch (error: any) {
    console.log(error, "GET_MESSAGES_ERROR");
    return new NextResponse("Internal Error", { status: 500 });
  }
}

const PostData = z.object({
  content: z.string().min(1),
});

const ChatId = z.string().uuid();

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
      console.log(zodParse.error);
      return new NextResponse("Bad request", { status: 400 });
    }

    const memberData = await db
      .select({ id: members.id, name: users.name, image: users.image })
      .from(members)
      .innerJoin(users, eq(members.userId, users.id))
      .where(
        and(
          eq(members.userId, user.id),
          eq(members.chatId, chatId.data)
        )
      );

    if (memberData.length === 0) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const [newMessage] = await db
      .insert(messages)
      .values({
        chatId: chatId.data,
        memberId: memberData[0].id,
        content: zodParse.data.content,
      })
      .returning();

    const fullNewMessage = {...newMessage, member: {
      id: memberData[0].id,
      user: {
        name: memberData[0].name,
        image: memberData[0].image,
      },
      seenMessages: []
    }};

    const channelName = `chat=${chatId.data}`;

    await pusherServer.trigger(channelName, 'message=new', fullNewMessage);
    return NextResponse.json(fullNewMessage);
  } catch (error: any) {
    console.log(error, "POST_MESSAGE_ERROR");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
