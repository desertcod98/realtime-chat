"use client";

import { FullMessage } from "@/app/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Attachment from "./Attachment";
import { AiFillDelete } from "@react-icons/all-files/ai/AiFillDelete";
import DeleteAlert from "./DeleteAlert";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Message({
  message,
  isGroup,
  userId,
}: {
  message: FullMessage;
  isGroup: boolean;
  userId: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function onDelete(){
    fetch("/api/message/"+message.id, {
      method: "DELETE",
    }).then((res) => {
      if (res.status !== 200) {
        res.text().then((error) => toast.error(error));
      } else {
        toast.success("Message deleted");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 hover:bg-slate-200 rounded-md w-[97%] relative group">
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
        <div className="flex w-fit max-w-[90%] items-center ml-14 max-h-60 gap-5 bg-slate-50 mr-14 rounded-xl overflow-x-auto">
          {message.messageFiles.map((file) => {
            return <Attachment key={file.url} {...file} />;
          })}
        </div>
      )}
      {message.member.userId === userId && (
        <div className="hidden absolute top-[-10px] right-5 group-hover:flex gap-2 bg-slate-100 border-2 border-zinc-500 rounded-lg">
          <AiFillDelete size={25} className="cursor-pointer" onClick={() => setIsDeleting(true)}/>
          <DeleteAlert close={() => setIsDeleting(false)} open={isDeleting} delete={onDelete}/>
        </div>
      )}
    </div>
  );
}
