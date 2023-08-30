import getCurrentUser from "@/app/actions/getCurrentUser";
import db from "@/db";
import { members } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

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
          }
        },
      },
      where: and(eq(members.userId, user.id), eq(members.chatId, params.id))
    })
  }catch(e){
    redirect("/");
  }
  
  if(!memberData){
    redirect("/");
  }

  return (
    <>
      <span>{memberData.chat.created_at.toDateString()}</span>
    </>
  )
}