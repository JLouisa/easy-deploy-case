import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "./env";
import fs from "fs";

// const s3 = new S3Client({
//   region: "auto",
//   endpoint: env.CLOUDFLARE_R2_ENDPOINT,
//   credentials: {
//     accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
//     secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
//   },
// });

const s3 = new S3Client({
  region: env.AWS_REGION,
  // endpoint: env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadFile = async (fileName: string, localFilePath: string) => {
  console.log("Called");

  // Create a readable stream from the local file
  const fileStream = fs.createReadStream(localFilePath);

  // Configure S3 parameters
  const params = {
    Bucket: env.BUCKET_NAME,
    Key: fileName,
    Body: fileStream,
  };

  const command = new PutObjectCommand(params);

  // Upload the file asynchronously
  try {
    const response = await s3.send(command);
    console.log(response);
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error; // Re-throw the error for handling upstream
  }
};
