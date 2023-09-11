"use client";

import { Skeleton } from "@/components/ui/skeleton";
import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";

interface AttachmentProps {
  url: string;
  name: string;
}

export default function Attachment({ url, name }: AttachmentProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      <Image
        src={url}
        alt={name}
        width={300}
        height={100}
        className={clsx("object-contain rounded-md max-h-52 cursor-pointer", !isLoaded && "w-0")}
        onLoad={() => setIsLoaded(true)}
      />
      {!isLoaded && <Skeleton className="w-[320px] h-[220px]  min-w-[225px]" />}
    </>
  );
}
