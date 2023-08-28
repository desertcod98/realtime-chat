import { S3Client } from "@aws-sdk/client-s3";

function getS3Client(){
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

declare global {
  var cachedS3: S3Client;
}

let s3: S3Client;
if (process.env.NODE_ENV === "production") {
  s3 = getS3Client();
} else {
  if (!global.cachedS3) {
    s3 = getS3Client();
    global.cachedS3 = s3;
  }
  s3 = global.cachedS3;
}

export default s3;