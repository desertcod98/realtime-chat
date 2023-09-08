"use client";

import Image from "next/image";

interface AttachmentProps {
  url: string;
  name: string;
}

export default function Attachment({ url, name }: AttachmentProps) {
  return (
    <Image src={url} alt={name} width={300} height={100} className="object-contain rounded-md max-h-60"/>
  );
}
