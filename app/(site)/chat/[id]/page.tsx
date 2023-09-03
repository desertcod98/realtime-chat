import getCurrentUser from "@/app/actions/getCurrentUser";
import db from "@/db";
import { members, messages } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Body from "./components/Body";

interface ChatParams{
  id: string;
}

export default async function Chat({params} : {params: ChatParams}){
  const user = await getCurrentUser();
  if(!user){
    redirect("/");
  }

  let memberData = undefined;

  try{
    memberData = await db.query.members.findFirst({
      with: {
        chat: {
          with: {
            members: true,
            messages: {
              limit: 3,
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
          },
        },
      },
      where: and(eq(members.userId, user.id), eq(members.chatId, params.id)),
    })
  }catch(e){
    redirect("/");
  }
  if(!memberData){
    redirect("/");
  }

  return (

      <Body initialMessages={memberData.chat.messages} chatId={memberData.chatId}/>

  )
}