import express, { Request, Response } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import { simpleGit } from "simple-git";
import { env } from "./env";

import { generate, getOutputDir } from "./utils";
import { getAllFiles } from "./file";
import { uploadFile } from "./aws";

import { createClient } from "redis";

// Redis client - for writing
const redis = createClient().on("error", (err) =>
  console.log("Redis Client Error", err)
);
redis.connect();

// Redis DB - for reading
const redisDB = createClient().on("error", (err) =>
  console.log("Redis Client Error", err)
);
redisDB.connect();

// Create Express server.
const app = express();

// Middleware
app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl;

  // Check if repoUrl is provided
  if (!repoUrl) {
    return res.json({ message: "Repo URL is required" });
  }

  // Generate a unique id for the deployment
  const id = generate();

  // Initialize simple-git
  const git = simpleGit();

  // Create output directory
  const outputDir = getOutputDir();
  const outputDirId = outputDir.concat(`/${id}`);

  try {
    // Clone the repo
    await git.clone(repoUrl, outputDirId);

    // Put repo in S3
    const files = getAllFiles(outputDirId);
    console.log(files);

    // Assuming uploadFile returns a Promise
    const uploadPromises = files.map(async (file) => {
      const filePath = "output/" + file.slice(outputDir.length + 1);
      try {
        await uploadFile(filePath, file);
        console.log(`File ${file} uploaded successfully.`);
      } catch (error) {
        console.error(`Error uploading file ${file}:`, error);
        // Handle error as needed
      }
    });

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);

    console.log("All files uploaded successfully.");
  } catch (e) {
    // handle all errors here
    console.log(e);
    res.json({
      message: `Something went wrong getting github repo... ${repoUrl}`,
    });
  } finally {
    // Add the id to the build queue
    redis.lPush("build-queue", id);

    // Set the status of the id to uploaded
    redis.hSet("status", id, "uploaded");
    res.json({ id, message: `Cloning Repo successful. ID: ${id}` });
  }
});

// Get the status of the id
app.get("/status/:id", async (req, res) => {
  const id = req.params.id;

  // Get the status of the id
  const status = await redisDB.hGet("status", id);

  if (!status) {
    return res.json({ message: "ID not found" });
  }

  res.json({ id, status });
});

// Start Express server.
app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
