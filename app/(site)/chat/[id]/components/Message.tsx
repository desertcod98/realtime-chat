"use client";

import { FullMessage } from "@/app/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Message({
  message,
  isGroup,
}: {
  message: FullMessage;
  isGroup: boolean;
}) {
  return (
    <div className="flex items-center gap-5">
      <Avatar className="cursor-pointer hover:opacity-80">
        <AvatarImage src={message.member.user.image ?? undefined} />
        <AvatarFallback>{message.member.user.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <h3 className="font-semibold">{message.member.user.name}</h3>
        <span>{message.content}</span>
      </div>
    </div>
  );
}
