import getCurrentUser from "@/app/actions/getCurrentUser";
import db from "@/db";
import { chats, members } from "@/db/schema";
import { eq, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import NavbarChat from "./NavbarChat";

export default async function Navbar() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const membersData = await db.query.members.findMany({
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
            where: ne(members.userId, user.id),
          }
        }
      },
    },
    where: eq(members.userId, user.id),
  });

  return (
    <div className="flex flex-col gap-3">
      {membersData.map((member) => {
        if(!member.chat.isGroup){
          return <NavbarChat key = {member.id } name={member.chat.members[0].user.name} chatId={member.chatId} imgUrl={member.chat.members[0].user.image ?? undefined}/>
        }else{
          return <NavbarChat key = {member.id } name={member.chat.name!} chatId={member.chatId} imgUrl={member.chat.image ?? undefined}/>
        }
      })}
    </div>
  );
}
