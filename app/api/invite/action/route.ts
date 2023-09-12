import getCurrentUser from "@/app/actions/getCurrentUser";
import db from "@/db";
import { invites, members, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const PatchData = z.object({
  inviteId: z.number(),
  action: z.enum(["ACCEPT", "REJECT"]),
});

export async function PATCH(
  request: Request,
) {
  const user = await getCurrentUser();

  if (!user) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const body = await request.json();
    const zodParse = PatchData.safeParse(body);

    if (!zodParse.success) {
      console.log(zodParse.error)
      return new NextResponse("Bad request", { status: 400 });
    }

    const [invite] = await db
      .select({state: invites.state, chatId: members.chatId})
      .from(invites)
      .innerJoin(members, eq(invites.inviterId, members.id))
      .where(
        and(
          eq(invites.id, zodParse.data.inviteId),
          eq(invites.invitedId, user.id)
        )
      );

    if (!invite) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if(invite.state !== "PENDING"){
      return new NextResponse("Forbidden", { status: 403 });
    }
    await db
      .update(invites)
      .set({
        state: zodParse.data.action === "ACCEPT" ? "ACCEPTED" : "REJECTED",
      })
      .where(eq(invites.id, zodParse.data.inviteId));

    let newMember = {};
    if(zodParse.data.action === "ACCEPT")
    [newMember] = await db.insert(members).values({chatId: invite.chatId, userId: user.id}).returning();

    return NextResponse.json(newMember);
  } catch (error: any) {
    console.log(error, "INVITE_ACTION_ERROR");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
