"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export default function FooterAvatar({
  image,
  fallback,
}: {
  image: string | null;
  fallback: string;
}) {
  const router = useRouter();

  return (
    <Avatar onClick={() => router.push("/profile")} className="cursor-pointer hover:opacity-80">
      <AvatarImage src={image ?? undefined}  />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}
