import getCurrentUser from "@/app/actions/getCurrentUser";
import db from "@/db";
import { members, messageFiles, messages, users } from "@/db/schema";
import { pusherServer } from "@/lib/pusher";
import s3 from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, desc, eq, lt, placeholder } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const messages_batch = 17;

const pGetMessagesCursor = db.query.members
  .findFirst({
    with: {
      chat: {
        columns: {
          id: true,
        },
        with: {
          messages: {
            where: placeholder("cursor")
              ? lt(messages.id, placeholder("cursor"))
              : undefined,
            limit: messages_batch,
            orderBy: desc(messages.id),
            with: {
              messageFiles: {
                columns: {
                  key: true,
                  name: true,
                },
              },
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
      eq(members.chatId, placeholder("chatId")),
      eq(members.userId, placeholder("userId"))
    ),
  })
  .prepare("p_get_messages_cursor");

const pGetMessages = db.query.members
  .findFirst({
    with: {
      chat: {
        columns: {
          id: true,
        },
        with: {
          messages: {
            limit: messages_batch,
            orderBy: desc(messages.id),
            with: {
              messageFiles: {
                columns: {
                  key: true,
                  name: true,
                },
              },
              member: {
                columns: {
                  id: true,
                  userId: true,
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
      eq(members.chatId, placeholder("chatId")),
      eq(members.userId, placeholder("userId"))
    ),
  })
  .prepare("p_get_messages");

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
    member = cursor
      ? await pGetMessagesCursor.execute({
          cursor,
          chatId: params.chatId,
          userId: user.id,
        })
      : await pGetMessages.execute({ chatId: params.chatId, userId: user.id });
  } catch (e) {
    console.log(e, "GET_MESSAGES_ERROR");
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

    const fullMessages = await Promise.all(
      member.chat.messages.map(async (message) => {
        const { messageFiles, ...rest } = message;
        const messageFilesUrls = await Promise.all(
          messageFiles.map(async (file) => {
            return {
              url: await getSignedUrl(
                s3,
                new GetObjectCommand({
                  Bucket: "realtime-chat",
                  Key: file.key,
                }),
                { expiresIn: 3600 }
              ),
              name: file.name,
            };
          })
        );
        return { ...rest, messageFiles: messageFilesUrls };
      })
    );

    return NextResponse.json({ items: fullMessages, nextCursor });
  } catch (error: any) {
    console.log(error, "GET_MESSAGES_ERROR");
    return new NextResponse("Internal Error", { status: 500 });
  }
}



const pMemberData = db
.select({ id: members.id, name: users.name, image: users.image, userId: users.id })
.from(members)
.innerJoin(users, eq(members.userId, users.id))
.where(and(eq(members.userId, placeholder("userId")), eq(members.chatId, placeholder("chatId")))).prepare("p_member_data");

const pNewMessage = db
.insert(messages)
.values({
  chatId: placeholder("chatId"),
  memberId: placeholder("memberId"),
  content: placeholder("content"),
})
.returning().prepare("p_new_message");

const PostData = z.object({
  content: z.union([z.string().length(0), z.string().min(1)]).optional(),
  uploadedFiles: z
    .array(
      z.object({
        name: z.string().min(1),
        key: z.string().min(1),
      })
    )
    .optional(),
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
      return new NextResponse("Bad request", { status: 400 });
    }

    if (
      !zodParse.data.content &&
      (!zodParse.data.uploadedFiles || zodParse.data.uploadedFiles.length === 0)
    ) {
      return new NextResponse("No message or files sent", { status: 400 });
    }
    
    const memberData = await pMemberData.execute({userId: user.id, chatId: chatId.data})

    if (memberData.length === 0) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const [newMessage] = await pNewMessage.execute({chatId: chatId.data, memberId: memberData[0].id, content: zodParse.data.content ?? null})

    let messageFilesUrls: any[] = [];

    if (zodParse.data.uploadedFiles && zodParse.data.uploadedFiles.length > 0) {
      await db.insert(messageFiles).values(
        zodParse.data.uploadedFiles.map((file) => {
          return { ...file, messageId: newMessage.id };
        })
      );
      messageFilesUrls = await Promise.all(
        zodParse.data.uploadedFiles.map(async (file) => {
          return {
            url: await getSignedUrl(
              s3,
              new GetObjectCommand({
                Bucket: "realtime-chat",
                Key: file.key,
              }),
              { expiresIn: 3600 }
            ),
            name: file.name,
          };
        })
      );
    }

    const fullNewMessage = {
      ...newMessage,
      member: {
        id: memberData[0].id,
        userId: memberData[0].userId,
        user: {
          name: memberData[0].name,
          image: memberData[0].image,
        },
        seenMessages: [],
      },
      messageFiles: messageFilesUrls,
    };

    //TODO return added images

    const channelName = `chat=${chatId.data}`;

    await pusherServer.trigger(channelName, "message=new", fullNewMessage);
    return NextResponse.json(fullNewMessage);
  } catch (error: any) {
    console.log(error, "POST_MESSAGE_ERROR");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
