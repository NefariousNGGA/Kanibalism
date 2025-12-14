import type { Express } from "express";
import { createServer, type Server } from "http";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { storage } from "./storage";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  authMiddleware,
  optionalAuthMiddleware,
  type AuthenticatedRequest,
} from "./auth";
import { registerSchema, loginSchema, insertThoughtSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ONE-TIME: Initialize database tables
  app.post("/api/init-db", async (req, res) => {
    try {
      // users
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          display_name TEXT,
          bio TEXT,
          avatar_url TEXT,
          is_admin BOOLEAN DEFAULT false NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);

      // tags
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS tags (
          id VARCHAR(36) PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          slug TEXT NOT NULL UNIQUE
        );
      `);

      // thoughts
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS thoughts (
          id VARCHAR(36) PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          content TEXT NOT NULL,
          excerpt TEXT,
          reading_time INTEGER DEFAULT 1 NOT NULL,
          word_count INTEGER DEFAULT 0 NOT NULL,
          author_id VARCHAR(36) REFERENCES users(id) NOT NULL,
          is_published BOOLEAN DEFAULT true NOT NULL,
          view_count INTEGER DEFAULT 0 NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);

      // thought_tags
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS thought_tags (
          thought_id VARCHAR(36) REFERENCES thoughts(id) ON DELETE CASCADE NOT NULL,
          tag_id VARCHAR(36) REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
          PRIMARY KEY (thought_id, tag_id)
        );
      `);

      res.json({ success: true, message: "Database initialized successfully" });
    } catch (error) {
      console.error("Init DB error:", error);
      res.status(500).json({ message: "Failed to initialize database" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);

      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      const existingUsername = await storage.getUserByUsername(data.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser({ ...data, password: hashedPassword });
      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const isValid = await verifyPassword(data.password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/thoughts", async (req, res) => {
    try {
      const { limit, tag, search, exclude } = req.query;
      const thoughts = await storage.getThoughts({
        limit: limit ? parseInt(limit as string) : undefined,
        tag: tag as string | undefined,
        search: search as string | undefined,
        exclude: exclude as string | undefined,
      });
      res.json(thoughts);
    } catch (error) {
      console.error("Error fetching thoughts:", error);
      res.status(500).json({ message: "Failed to fetch thoughts" });
    }
  });

  app.get("/api/thoughts/my", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const thoughts = await storage.getThoughts({ authorId: req.user!.id });
      res.json(thoughts);
    } catch (error) {
      console.error("Error fetching user thoughts:", error);
      res.status(500).json({ message: "Failed to fetch thoughts" });
    }
  });

  app.get("/api/thoughts/by-id/:id", async (req, res) => {
    try {
      const thought = await storage.getThoughtById(req.params.id);
      if (!thought) {
        return res.status(404).json({ message: "Thought not found" });
      }
      res.json(thought);
    } catch (error) {
      console.error("Error fetching thought:", error);
      res.status(500).json({ message: "Failed to fetch thought" });
    }
  });

  app.get("/api/thoughts/:slug", async (req, res) => {
    try {
      const thought = await storage.getThoughtBySlug(req.params.slug);
      if (!thought) {
        return res.status(404).json({ message: "Thought not found" });
      }
      await storage.incrementViewCount(thought.id);
      res.json(thought);
    } catch (error) {
      console.error("Error fetching thought:", error);
      res.status(500).json({ message: "Failed to fetch thought" });
    }
  });

  app.post("/api/thoughts", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { tagNames, ...thoughtData } = req.body;
      const validated = insertThoughtSchema.parse(thoughtData);

      const thought = await storage.createThought(validated, req.user!.id, tagNames || []);
      res.status(201).json(thought);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error creating thought:", error);
      res.status(500).json({ message: "Failed to create thought" });
    }
  });

  app.patch("/api/thoughts/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const thought = await storage.getThoughtById(req.params.id);
      if (!thought) {
        return res.status(404).json({ message: "Thought not found" });
      }

      if (thought.authorId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to edit this thought" });
      }

      const { tagNames, ...updateData } = req.body;
      const updated = await storage.updateThought(req.params.id, updateData, tagNames);
      res.json(updated);
    } catch (error) {
      console.error("Error updating thought:", error);
      res.status(500).json({ message: "Failed to update thought" });
    }
  });

  app.delete("/api/thoughts/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const thought = await storage.getThoughtById(req.params.id);
      if (!thought) {
        return res.status(404).json({ message: "Thought not found" });
      }

      if (thought.authorId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this thought" });
      }

      await storage.deleteThought(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting thought:", error);
      res.status(500).json({ message: "Failed to delete thought" });
    }
  });

  app.get("/api/tags", async (req, res) => {
    try {
      const tagsWithCount = await storage.getTags();
      res.json(tagsWithCount);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });

  app.get("/api/tags/:slug", async (req, res) => {
    try {
      const tag = await storage.getTagBySlug(req.params.slug);
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      res.json(tag);
    } catch (error) {
      console.error("Error fetching tag:", error);
      res.status(500).json({ message: "Failed to fetch tag" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/stats/my", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const stats = await storage.getStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  return httpServer;
}