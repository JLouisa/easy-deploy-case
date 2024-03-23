import { S3 } from "aws-sdk";
import { env } from "./env";
import fs from "fs";

const s3 = new S3({
  accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  secretAccessKey: env.CLOUDFLARE_R2_TOKEN_VALUE,
  endpoint: env.CLOUDFLARE_R2_EU_ENDPOINT,
});

export const uploadFile = async (fileName: string, localFilePath: string) => {
  console.log("Called");
  const fileContent = fs.readFileSync(localFilePath);
  const response = await s3
    .upload({
      Body: fileContent,
      Bucket: env.BUCKET_NAME,
      Key: fileName,
    })
    .promise();
  console.log(response);
};
