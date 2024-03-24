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
const aws_sdk_1 = require("aws-sdk");
const env_1 = require("./env");
const fs_1 = __importDefault(require("fs"));
const s3 = new aws_sdk_1.S3({
    accessKeyId: env_1.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: env_1.env.CLOUDFLARE_R2_TOKEN_VALUE,
    endpoint: env_1.env.CLOUDFLARE_R2_EU_ENDPOINT,
});
const uploadFile = (fileName, localFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Called");
    const fileContent = fs_1.default.readFileSync(localFilePath);
    const response = yield s3
        .upload({
        Body: fileContent,
        Bucket: env_1.env.BUCKET_NAME,
        Key: fileName,
    })
        .promise();
    console.log(response);
});
exports.uploadFile = uploadFile;
