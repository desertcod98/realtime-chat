import getCurrentUser from "@/app/actions/getCurrentUser";
import { redirect } from "next/navigation";
import FooterAvatar from "./FooterAvatar";

export default async function Footer() {
  const user = await getCurrentUser();

  if(!user){
    redirect("/login");
  }

  return (
    <div className="w-full h-24 border-t-2 flex items-center px-3">
      <FooterAvatar image={user.image} fallback={user.name[0]}/>
    </div>
  );
}
