import express, { Request, Response } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import { simpleGit } from "simple-git";

import { generate } from "./utils";

// Create Express server.
const app = express();

// Get port from environment and store in Express.
const port = process.env.PORT || 3000;
app.set("port", port);

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
    await git.clone(repoUrl, `./output/${id}`);
    res.json({ message: `Cloning Repo successful. ID: ${id}` });
  } catch (e) {
    // handle all errors here
    console.log(e);
    res.json({
      message: `Something went wrong getting github repo... ${repoUrl}`,
    });
  }
});

// Start Express server.
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
