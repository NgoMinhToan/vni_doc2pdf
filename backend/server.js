import express from "express";
import multer from "multer";
import { execFile } from "child_process";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: "/tmp/uploads" });

const log = (level, msg, extra = {}) => {
    const time = new Date().toISOString();
    const data = Object.keys(extra).length
        ? " " + JSON.stringify(extra)
        : "";
    console.log(`[${time}] [${level}] ${msg}${data}`);
};

// 👉 SERVE FRONTEND
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        log("WARN", "Upload without file");
        return res.status(400).send("No file uploaded");
    }

    const jobId = randomUUID();
    const jobDir = `/tmp/job-${jobId}`;
    const outputDir = `${jobDir}/out`;

    log("INFO", "New upload", {
        jobId,
        originalName: req.file.originalname,
        tempPath: req.file.path,
    });

    fs.mkdirSync(outputDir, { recursive: true });

    log("INFO", "Start LibreOffice", { jobId });

    execFile(
        "soffice",
        [
            "--headless",
            "--nologo",
            "--nolockcheck",
            "--nodefault",
            "--nofirststartwizard",
            "--convert-to",
            "pdf",
            "--outdir",
            outputDir,
            req.file.path,
        ],
        (err, stdout, stderr) => {
            if (err) {
                log("ERROR", "Convert failed", {
                    jobId,
                    error: err.message,
                });
                return res.status(500).send("Convert failed");
            }

            log("INFO", "LibreOffice finished", { jobId });

            const pdfFile = fs
                .readdirSync(outputDir)
                .find((f) => f.endsWith(".pdf"));

            if (!pdfFile) {
                log("ERROR", "PDF not found", { jobId });
                return res.status(500).send("PDF not generated");
            }

            const pdfPath = path.join(outputDir, pdfFile);

            log("INFO", "Send PDF", {
                jobId,
                pdfPath,
            });

            res.download(pdfPath, "result.pdf", () => {
                fs.rmSync(jobDir, { recursive: true, force: true });
                fs.unlinkSync(req.file.path);
                log("INFO", "Cleanup done", { jobId });
            });
        }
    );
});

app.listen(3000, () => {
    log("INFO", "Server started", {
        url: "http://localhost:3000",
    });
});
