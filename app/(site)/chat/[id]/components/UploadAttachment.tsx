"use client";

import Image from "next/image";
import x from "@/public/assets/x.svg"

interface UploadAttachmentProps {
  url: string;
  name: string;
  removeAttachment: () => void;
}

export default function UploadAttachment({
  url,
  name,
  removeAttachment,
}: UploadAttachmentProps) {
  return (
    <div className="relative">
      <div className="absolute top-0 right-0 cursor-pointer" onClick={removeAttachment}>
        <Image
          src={x}
          alt="Remove attachment"
          width={35}
          height={35}
          className="bg-white rounded-full"
        />
      </div>
      <Image
        src={url}
        alt={name}
        width={300}
        height={100}
        className="object-contain rounded-md max-h-60"
      />
    </div>
  );
}
