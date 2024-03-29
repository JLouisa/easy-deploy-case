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
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const simple_git_1 = require("simple-git");
const env_1 = require("./env");
const utils_1 = require("./utils");
const file_1 = require("./file");
const aws_1 = require("./aws");
const redis_1 = require("redis");
// Redis client - for writing
const redis = (0, redis_1.createClient)().on("error", (err) => console.log("Redis Client Error", err));
redis.connect();
// Redis DB - for reading
const redisDB = (0, redis_1.createClient)().on("error", (err) => console.log("Redis Client Error", err));
redisDB.connect();
// Create Express server.
const app = (0, express_1.default)();
// Middleware
app.use((0, morgan_1.default)("dev"));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
// Routes
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
app.post("/deploy", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const repoUrl = req.body.repoUrl;
    // Check if repoUrl is provided
    if (!repoUrl) {
        return res.json({ message: "Repo URL is required" });
    }
    // Generate a unique id for the deployment
    const id = (0, utils_1.generate)();
    // Initialize simple-git
    const git = (0, simple_git_1.simpleGit)();
    // Create output directory
    const outputDir = (0, utils_1.getOutputDir)();
    const outputDirId = outputDir.concat(`/${id}`);
    try {
        // Clone the repo
        yield git.clone(repoUrl, outputDirId);
        // Put repo in S3
        const files = (0, file_1.getAllFiles)(outputDirId);
        console.log(files);
        // Assuming uploadFile returns a Promise
        const uploadPromises = files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            const filePath = "output/" + file.slice(outputDir.length + 1);
            try {
                yield (0, aws_1.uploadFile)(filePath, file);
                console.log(`File ${file} uploaded successfully.`);
            }
            catch (error) {
                console.error(`Error uploading file ${file}:`, error);
                // Handle error as needed
            }
        }));
        // Wait for all uploads to complete
        yield Promise.all(uploadPromises);
        console.log("All files uploaded successfully.");
    }
    catch (e) {
        // handle all errors here
        console.log(e);
        res.json({
            message: `Something went wrong getting github repo... ${repoUrl}`,
        });
    }
    finally {
        // Add the id to the build queue
        redis.lPush("build-queue", id);
        // Set the status of the id to uploaded
        redis.hSet("status", id, "uploaded");
        res.json({ id, message: `Cloning Repo successful. ID: ${id}` });
    }
}));
// Get the status of the id
app.get("/status/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    // Get the status of the id
    const status = yield redisDB.hGet("status", id);
    if (!status) {
        return res.json({ message: "ID not found" });
    }
    res.json({ id, status });
}));
// Start Express server.
app.listen(env_1.env.PORT, () => {
    console.log(`Server running on port ${env_1.env.PORT}`);
});
