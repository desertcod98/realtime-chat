import getCurrentUser from "@/app/actions/getCurrentUser";
import db from "@/db";
import { members, messages } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Body from "./components/Body";

interface ChatParams {
  id: string;
}

export default async function Chat({ params }: { params: ChatParams }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  // const memberData = await db.select({id: members.id}).from(members).where(and(eq(members.userId, user.id), eq(members.chatId, params.id)));
  // if(memberData.length === 0){
  //   redirect("/");
  // }

  let memberData = undefined;

  try {
    memberData = await db.query.members.findFirst({
      columns: {
        chatId: true,
      },
      with: {
        chat: {
          columns: {
            isGroup: true,
          }
        },
      },
      where: and(eq(members.userId, user.id), eq(members.chatId, params.id)),
    });
  } catch (e) {
    redirect("/");
  }
  if (!memberData) {
    redirect("/");
  }
  return (
    <Body
      isGroup={memberData.chat.isGroup}
      chatId={memberData.chatId}
    />
  );
}
