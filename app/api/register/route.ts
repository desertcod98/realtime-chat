import bcrypt from "bcrypt";
import { createId } from '@paralleldrive/cuid2';
import db from "@/db";
import { NextResponse } from "next/server";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

interface RequestData{
  email: string;
  name: string;
  password: string;
  imgUrl: string | undefined;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password, imgUrl } : RequestData = body;

    if (!email || !password || !name) {
      return new NextResponse("Missing info", { status: 400 });
    }

    const [{count}] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.email, email));

    if(count > 0){
      return new NextResponse("Email address already in use", { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [user] = await db.insert(users).values({
      email,
      name,
      hashedPassword,
      id: createId(),
      image: imgUrl ?? undefined
    }).returning()

    return NextResponse.json(user);
  } catch (error: any) {
    console.log(error, "REGISTRATION_ERROR");
    return new NextResponse("Internal Error", { status: 500 }); 
  }
}
