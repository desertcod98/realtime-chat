import getCurrentUser from "@/app/actions/getCurrentUser";
import db from "@/db";
import { members } from "@/db/schema";
import { eq, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import NavbarChats from "./NavbarChats";
import Footer from "./Footer";

export default async function Navbar() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }
  const membersData = await db.query.members.findMany({
    with: {
      chat: {
        with: {
          members: {
            with: {
              user: {
                columns: {
                  name: true,
                  image: true,
                },
              },
            },
            where: ne(members.userId, user.id),
          },
        },
      },
    },
    where: eq(members.userId, user.id),
  });

  return (
    <div className="flex flex-col justify-between h-full">
      <NavbarChats membersData={membersData} userId={user.id}/>
      <Footer/>
    </div>  
  );
}
