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
const utils_1 = require("./utils");
// Create Express server.
const app = (0, express_1.default)();
// Get port from environment and store in Express.
const port = process.env.PORT || 3000;
app.set("port", port);
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
    try {
        // Clone the repo
        yield git.clone(repoUrl, `./output/${id}`);
        res.json({ message: `Deployed... ${repoUrl}` });
    }
    catch (e) {
        // handle all errors here
        console.log(e);
        res.json({
            message: `Something went wrong getting git repo... ${repoUrl}`,
        });
    }
}));
// Start Express server.
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
