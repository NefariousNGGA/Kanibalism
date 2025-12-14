import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}. Make sure to build the client first.`
    );
  }

  // Serve static assets (JS, CSS, images)
  app.use(express.static(distPath));

  // Serve index.html for any route that doesn't match a static file
  // This ensures client-side routing (wouter) works
  app.get("*", (req, res) => {
    // Check if the request is for a static file (has an extension like .js, .css, .png)
    if (path.extname(req.path)) {
      // If it's a static file, 404 if not found (already handled by express.static)
      res.status(404).send("File not found");
    } else {
      // If it's a route like /thoughts/slug, serve index.html for SPA routing
      res.sendFile(path.resolve(distPath, "index.html"));
    }
  });
}