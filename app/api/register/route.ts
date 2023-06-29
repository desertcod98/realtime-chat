import bcrypt from "bcrypt";

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !password || !name) {
      return new NextResponse("Missing info", { status: 400 });
    }

    const existingUsers = await prisma.user.count({
      where: {
        email: email,
      }
    })

    if(existingUsers > 0){
      return new NextResponse("Email address already in use", { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.log(error, "REGISTRATION_ERROR");
    return new NextResponse("Internal Error", { status: 500 }); 
  }
}
