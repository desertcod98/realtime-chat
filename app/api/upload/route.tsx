import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";

import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { headers } from "next/dist/client/components/headers";
import s3 from "@/lib/s3";

export async function PUT(request: Request) {
  // const user = await getCurrentUser();
  // if(!user){
  //   return new NextResponse("Forbidden", {status: 403});
  // }

  try {
    const body = await request.json();
    const {fileName} = body;

    const uuid = crypto.randomUUID();
    const key = uuid+"-"+fileName;
    const putUrl = await getSignedUrl(s3, new PutObjectCommand({Bucket: 'realtime-chat-profile', Key: key}), { expiresIn: 60 })
    return NextResponse.json({putUrl, key});
  } catch (error: any) {
    console.log(error, "UPLOAD_ERROR");
    return new NextResponse("Internal Error", { status: 500 }); 
  }
}