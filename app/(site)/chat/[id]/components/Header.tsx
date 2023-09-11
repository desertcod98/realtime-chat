import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface HeaderProps {
  chatImage: string | null;
  chatName: string;
  profileId: string;
}

export default function Header(props: HeaderProps) {
  return (
    <Link href={"/profile/group/"+props.profileId} className="absolute top-0 z-10 w-[95%] h-20 bg-sky-300/50 flex items-center gap-4 rounded-md px-5 cursor-pointer hover:opacity-80">
      <Avatar>
        <AvatarImage src={props.chatImage ?? undefined} />
        <AvatarFallback>{props.chatName[0]}</AvatarFallback>
      </Avatar>
      <span>{props.chatName}</span>
    </Link>
  );
}
