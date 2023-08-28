"use client";

import Image from "next/image";

export default function NavbarChat({
  name,
  imgUrl,
  chatId,
}: {
  name: string;
  imgUrl?: string;
  chatId: string;
}) {
  return (
    <div className="flex w-full px-3 h-20 border-b-2 border- items-center gap-10 cursor-pointer" onClick={() => console.log("div")}> 
      <div className="w-14 h-14 relative">
        <Image
          src={imgUrl || "/assets/noImage.svg"}
          alt={"Chat image"}
          fill
          className="rounded-[50%] object-cover"
          onClick={(e) => {e.stopPropagation();console.log("image")}}
        />
      </div>
      <span>{name}</span>
    </div>
  );
}
