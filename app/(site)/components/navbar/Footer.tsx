import getCurrentUser from "@/app/actions/getCurrentUser";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import NewChatDialog from "./NewChatDialog";
import Notifications from "./Notifications";

export default async function Footer() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="w-full h-24 min-h-[96px] border-t-2 flex items-center px-3 justify-between pr-10">
      <Link href={"/profile"} className="flex w-2/5 gap-5 items-center">
        <Avatar className="cursor-pointer hover:opacity-80">
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <span className="text-ellipsis whitespace-nowrap overflow-hidden">
          {user.name}
        </span>
      </Link>
      <div className="flex gap-6">
        <Notifications userId={user.id}/>
        <NewChatDialog />
        <LogoutButton />
      </div>
    </div>
  );
}
