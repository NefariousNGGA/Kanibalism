// server/routes/init-db.ts
import { sql } from "drizzle-orm";
import { db } from "../../db";

export async function initDatabase() {
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

    console.log("✅ Database tables created successfully");
  } catch (error) {
    console.error("❌ Failed to create tables:", error);
    throw error;
  }
}