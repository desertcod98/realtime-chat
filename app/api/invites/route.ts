import getCurrentUser from "@/app/actions/getCurrentUser";
import db from "@/db";
import { invites, members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
) {
  const user = await getCurrentUser();

  if(!user){
    return new NextResponse("Forbidden", { status: 403 });
  }

  try{
    // const invitesData = await db.select().from(invites).innerJoin(members, eq(invites.inviterId, members.id)).where(eq(invites.invitedId, user.id));
    // console.log(invitesData);

    const invitesData = await db.query.invites.findMany({
      // columns: {
      //   id: true,
      //   inviterId: true,
      //   expiresAt: true,
      //   createdAt: true,
      // },
      with: {
        inviter: {
          // columns: {
          //   id: true,
          //   createdAt: true,
          // },
          // with: {
          //   user: {
          //     columns: {
          //       name: true,
          //     image: true,
          //     }
          //   },
          //   chat: {
          //     columns: {
          //       image: true,
          //       isGroup: true,
          //       name: true,
          //       id: true,
          //     }
          //   }
          // }
        }
      },
      where: eq(invites.invitedId, user.id),
    })

    return NextResponse.json(invitesData);
  } catch (error: any) {
    console.log(error, "GET_INVITES_ERROR");
    return new NextResponse("Internal Error", { status: 500 });
  }
}