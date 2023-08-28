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
import axios from "axios";

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: Request) {
  // const user = await getCurrentUser();
  // if(!user){
  //   return new NextResponse("Forbidden", {status: 403});
  // }

  try {
    const uuid = crypto.randomUUID();
    const putUrl = await getSignedUrl(S3, new PutObjectCommand({Bucket: 'test', Key: "test.txt"}), { expiresIn: 60 })
    const res = await fetch(putUrl, {method: "PUT", body: "test"});
    console.log(res)
  } catch (error: any) {
    console.log(error, "UPLOAD_ERROR");
    return new NextResponse("Internal Error", { status: 500 }); 
  }
}
