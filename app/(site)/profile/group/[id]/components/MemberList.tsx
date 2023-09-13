import { FullMember } from "@/app/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import AddNewMember from "./AddNewMember";
import { Badge } from "@/components/ui/badge";

export default function MemberList({
  members,
  chatId,
  isAdministrator
}: {
  members: FullMember[];
  chatId: string;
  isAdministrator: boolean;
}) {
  return (
    <ScrollArea className="h-[392px] w-[550px] rounded-md border">
      {isAdministrator && <AddNewMember chatId={chatId} />}

      {members.map((member, i) => {
        return (
          <>
            <div className="flex items-center p-2">
              <Link
                href={"/profile/" + member.userId}
                className="flex w-[34%] px-3 h-full items-center gap-10"
              >
                <div className="w-14 h-14 relative flex items-center">
                  <Avatar className="cursor-pointer hover:opacity-80">
                    <AvatarImage src={member.user.image ?? undefined} />
                    <AvatarFallback>{member.user.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <span>{member.user.name}</span>
              </Link>
              {member.isAdministrator && <Badge>Administrator</Badge>}
            </div>
            <Separator className={members.length -1 === i ? "mt-2" : "my-2"} />
          </>
        );
      })}
    </ScrollArea>
  );
}
