import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import db from "@/db";
import { chats, members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import MemberList from "./components/MemberList";
import { Button } from "@/components/ui/button";
import getCurrentUser from "@/app/actions/getCurrentUser";

const groupId = z.string().min(1).uuid();

export default async function GroupProfile({
  params,
}: {
  params: { id: string };
}) {
  const zodGroupId = groupId.safeParse(params.id);
  if (!zodGroupId.success) redirect("/");

  const group = await db.query.chats.findFirst({
    with: {
      members: {
        with: {
          user: {
            columns: {
              image: true,
              name: true,
            }
          },
        },
        where: eq(members.isRemoved, false),
      },
    },
    where: eq(chats.id, zodGroupId.data),
  });

  if (!group) redirect("/");

  const user = await getCurrentUser();

  if(!user) return;

  const currentMember = group.members.find(i => i.userId === user.id);

  if(!currentMember) return;

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="flex flex-col items-center h-full p-5 w-[80%] bg-slate-50 gap-10">
        <Avatar className="w-52 h-52 bg-white">
          <AvatarImage src={group.image ?? undefined} />
          <AvatarFallback>{group.name![0]}</AvatarFallback>
        </Avatar>
        <span className="text-4xl font-semibold">{group.name!}</span>
        {group.description && (
          <span className="text-2xl">{group.description}</span>
        )}
        <MemberList members={group.members} chatId={group.id} isAdministrator={currentMember.isAdministrator ?? false}/>
      </div>
    </div>
  );
}
