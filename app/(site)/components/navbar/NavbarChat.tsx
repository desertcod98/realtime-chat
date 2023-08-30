"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function NavbarChat({
  name,
  imgUrl,
  chatId,
  setActive,
  active,
}: {
  name: string;
  imgUrl?: string;
  chatId: string;
  active: boolean;
  setActive: () => void;
}) {
  const router = useRouter();
  return (
    <div
      className={clsx(
        "flex w-full px-3 h-20 border-b-2 items-center gap-10 cursor-pointer",
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
      <span>{name}</span>
    </div>
  );
}
