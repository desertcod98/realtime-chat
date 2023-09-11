import getCurrentUser from "@/app/actions/getCurrentUser";
import db from "@/db";
import { members, messages } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Body from "./components/Body";
import Header from "./components/Header";

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
            image: true,
            id: true,
            name: true,
          },
          with: {
            members: {
              with: {
                user: {
                  columns: {
                    image: true,
                    name: true,
                    id: true,
                  },
                },
              },
            },
          },
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
    <div className="flex flex-col relative h-full w-full ">
      <Header
        chatImage={
          !memberData.chat.isGroup
            ? memberData.chat.members[0].user.image
            : memberData.chat.image
        }
        chatName={
          !memberData.chat.isGroup
            ? memberData.chat.members[0].user.name!
            : memberData.chat.name!
        }
        profileId={!memberData.chat.isGroup ? memberData.chat.members[0].user.id : memberData.chat.id}
      />
      <Body isGroup={memberData.chat.isGroup} chatId={memberData.chatId} />
    </div>
  );
}
