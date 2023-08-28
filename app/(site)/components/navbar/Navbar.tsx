import getCurrentUser from "@/app/actions/getCurrentUser";
import db from "@/db";
import { chats, members } from "@/db/schema";
import { eq, ne } from "drizzle-orm";
import { redirect } from "next/navigation";

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
    <>
      {membersData.map((member) => {
        if(!member.chat.isGroup){
          return <span key = {member.id }>{member.chat.members[0].user.name}</span>
        }else{
          return <span key = {member.id }>{member.chat.name}</span>
        }
      })}
    </>
  );
}
