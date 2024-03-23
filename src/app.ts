import express, { Request, Response } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import { simpleGit } from "simple-git";
import { env } from "./env";

import { generate } from "./utils";
import { getAllFiles } from "./file";

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

  try {
    // Clone the repo
    await git.clone(repoUrl, path.join(__dirname, `./output/${id}`));
    res.json({ message: `Cloning Repo successful. ID: ${id}` });

    // Put repo in S3
    const files = await getAllFiles(path.join(__dirname, `./output/${id}`));
    console.log(files);

    //
  } catch (e) {
    // handle all errors here
    console.log(e);
    res.json({
      message: `Something went wrong getting github repo... ${repoUrl}`,
    });
  }
});

// Start Express server.
app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
