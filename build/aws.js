"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const env_1 = require("./env");
const fs_1 = __importDefault(require("fs"));
// const s3 = new S3Client({
//   region: "auto",
//   endpoint: env.CLOUDFLARE_R2_ENDPOINT,
//   credentials: {
//     accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
//     secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
//   },
// });
const s3 = new client_s3_1.S3Client({
    region: env_1.env.AWS_REGION,
    // endpoint: env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
        accessKeyId: env_1.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env_1.env.AWS_SECRET_ACCESS_KEY,
    },
});
const uploadFile = (fileName, localFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Called");
    // Create a readable stream from the local file
    const fileStream = fs_1.default.createReadStream(localFilePath);
    // Configure S3 parameters
    const params = {
        Bucket: env_1.env.BUCKET_NAME,
        Key: fileName,
        Body: fileStream,
    };
    const command = new client_s3_1.PutObjectCommand(params);
    // Upload the file asynchronously
    try {
        const response = yield s3.send(command);
        console.log(response);
    }
    catch (error) {
        console.error("Error uploading file:", error);
        throw error; // Re-throw the error for handling upstream
    }
});
exports.uploadFile = uploadFile;
