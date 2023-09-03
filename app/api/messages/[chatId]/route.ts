import getCurrentUser from "@/app/actions/getCurrentUser";
import db from "@/db";
import { members, messages } from "@/db/schema";
import { and, desc, eq, lt } from "drizzle-orm";
import { NextResponse } from "next/server";

const messages_batch = 4;

export async function GET(request: Request, { params }: { params: { chatId: string } }) {
  const { searchParams } = new URL(request.url);
  const cursorParam = searchParams.get("cursor");

  const user = await getCurrentUser();

  if(!user){
    return new NextResponse("Forbidden", {status: 403});
  }

  let member = undefined;
  let cursor: number | undefined = undefined;

  if(cursorParam){
    cursor = +cursorParam;
    if (Number.isNaN(cursor)) {
      return new NextResponse("Bad request", { status: 400 });
    }
  }

  try{
    
    member = await db.query.members.findFirst({
      with: {
        chat: {
          columns: {
            id: true,
          },
          with: {
            messages: {
              where: cursor? lt(messages.id, cursor) : undefined,
              limit: messages_batch,
              orderBy: desc(messages.id),
              with: {
                seenMessages: {
                  columns: {
                    createdAt: true,
                  },
                  with: {
                    member: {
                      columns: {
                        id: true,
                      },
                      with:{
                        user: {
                          columns: {
                            name: true,
                            image: true,
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      where: and(eq(members.chatId, params.chatId), eq(members.userId, user.id)),
    })
  }catch(e){
    return new NextResponse("Bad request", {status: 400});
  }

  if(!member){
    return new NextResponse("Forbidden", {status:403});
  }

  try {
    let nextCursor = null;

    if (member.chat.messages.length === messages_batch) {
      nextCursor = member.chat.messages[messages_batch - 1].id;
    }

    return NextResponse.json({items : member.chat.messages, nextCursor});
  } catch (error: any) {
    console.log(error, "GET_MESSAGES_ERROR");
    return new NextResponse("Internal Error", { status: 500 }); 
  }
}
