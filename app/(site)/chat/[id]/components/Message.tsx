"use client";

import { FullMessage } from "@/app/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import Attachment from "./Attachment";

export default function Message({
  message,
  isGroup,
}: {
  message: FullMessage;
  isGroup: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
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
      {message.messageFiles && message.messageFiles.length > 0 && (
        <div className="flex items-center ml-14 max-h-60 bg-slate-400">
          {message.messageFiles.map(file => {
            return <Attachment key={file.url} {...file}/>
          })}
        </div>
      )}
    </div>
  );
}
