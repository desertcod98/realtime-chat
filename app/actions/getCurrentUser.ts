import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";

export default async function getCurrentUser() {
  const session = await getServerSession();
  if (!session || !session.user || !session.user.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });
  
  return user;
}
