import { pusherServer } from "@/lib/pusher";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
) {
  try {
    await pusherServer.trigger('test', 'test:new', 123);
  } catch (error) {
    console.log(error, 'ERROR_MESSAGES')
    return new NextResponse('Error', { status: 500 });
  }
}