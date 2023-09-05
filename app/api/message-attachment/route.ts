import s3 from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { z } from "zod";

const RequestData = z.array(z.string().min(1)).nonempty();


export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const zodParse = RequestData.safeParse(body);

    if (!zodParse.success) {
      console.log(zodParse.error);
      return new NextResponse("Bad request", { status: 400 });
    }

    const signedUrls = [];

    for (const name of zodParse.data) {
      const uuid = crypto.randomUUID();
      const key = uuid + "-" + name;
      const putUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({ Bucket: "realtime-chat", Key: key }),
        { expiresIn: 1200 }
      );
      signedUrls.push({
        name,
        key,
        putUrl,
      })

    }

    return NextResponse.json(signedUrls);
  } catch (error: any) {
    console.log(error, "MESSAGE_ATTACHMENT_ERROR");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
