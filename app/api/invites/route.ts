import getCurrentUser from "@/app/actions/getCurrentUser";
import db from "@/db";
import { invites, members, users } from "@/db/schema";
import { and, eq, placeholder } from "drizzle-orm";
import { NextResponse } from "next/server";

const pInvitesData = db
  .select({
    id: invites.id,
    inviterId: invites.inviterId,
    inviterImage: users.image,
    inviterName: users.name,
    expiresAt: invites.expiresAt,
  })
  .from(invites)
  .innerJoin(members, eq(invites.inviterId, members.id))
  .innerJoin(users, eq(members.userId, users.id))
  .where(
    and(
      eq(invites.invitedId, placeholder("userId")),
      eq(invites.state, "PENDING")
    )
  )
  .prepare("p_invites_data");

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const invitesData = await pInvitesData.execute({userId: user.id});

    // const invitesData = await db.query.invites.findMany({
    //   columns: {
    //     id: true,
    //     inviterId: true,
    //     expiresAt: true,
    //     createdAt: true,
    //   },
    //   with: {
    //     inviter: {
    //       columns: {
    //         id: true,
    //         createdAt: true,
    //       },
    //       with: {
    //         user: {
    //           columns: {
    //             name: true,
    //           image: true,
    //           }
    //         },
    //         chat: {
    //           columns: {
    //             image: true,
    //             isGroup: true,
    //             name: true,
    //             id: true,
    //           }
    //         }
    //       }
    //     }
    //   },
    //   where: eq(invites.invitedId, user.id),
    // })

    return NextResponse.json(invitesData);
  } catch (error: any) {
    console.log(error, "GET_INVITES_ERROR");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
