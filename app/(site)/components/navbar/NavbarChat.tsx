"use client";

import { PartialMessage } from "@/app/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import clsx from "clsx";
import { useRouter } from "next/navigation";

export default function NavbarChat({
  name,
  imgUrl,
  chatId,
  setActive,
  active,
  lastMessage,
}: {
  name: string;
  imgUrl?: string;
  chatId: string;
  active: boolean;
  setActive: () => void;
  lastMessage: PartialMessage | undefined;
}) {
  const router = useRouter();
  return (
    <div
      className={clsx(
        "flex w-[95%] px-3 h-20 border-b-2 items-center gap-10 cursor-pointer",
        active && "bg-slate-300"
      )}
      onClick={() => {
        setActive();
        router.push("/chat/" + chatId);
      }}
    >
      <div className="w-14 h-14 relative flex items-center">
        <Avatar
          onClick={() => router.push("/profile")}
          className="cursor-pointer hover:opacity-80"
        >
          <AvatarImage src={imgUrl} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col gap-2 justify-start">
        <span className="font-bold">{name}</span>
        {lastMessage && (
          <div className="flex gap-2">
            <span>{lastMessage.content}</span> {/*TODO add sender if chat is group*/} 
          </div>
        )}
      </div>
    </div>
  );
}
