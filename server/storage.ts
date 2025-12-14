import {
  users, thoughts, tags, thoughtTags,
  type User, type InsertUser,
  type Thought, type InsertThought,
  type Tag, type InsertTag,
  type ThoughtWithAuthor, type Stats
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, ilike, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(userId: string, profileData: Partial<Pick<User, 'displayName' | 'bio' | 'avatarUrl'>>): Promise<User | undefined>; // New function
  getThoughts(options?: { limit?: number; tag?: string; authorId?: string; search?: string; exclude?: string }): Promise<ThoughtWithAuthor[]>;
  getThoughtBySlug(slug: string): Promise<ThoughtWithAuthor | undefined>;
  getThoughtById(id: string): Promise<ThoughtWithAuthor | undefined>;
  createThought(thought: InsertThought, authorId: string, tagNames: string[]): Promise<ThoughtWithAuthor>;
  updateThought(id: string, thought: Partial<Thought>, tagNames?: string[]): Promise<ThoughtWithAuthor | undefined>;
  deleteThought(id: string): Promise<boolean>;
  incrementViewCount(id: string): Promise<void>;
  getTags(): Promise<Array<Tag & { count: number }>>;
  getTagBySlug(slug: string): Promise<Tag | undefined>;
  getOrCreateTag(name: string): Promise<Tag>;
  getStats(authorId?: string): Promise<Stats>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      id: randomUUID(), // Generate ID here
    }).returning();
    return user;
  }

  // NEW: Function to update user profile
  async updateUserProfile(userId: string, profileData: Partial<Pick<User, 'displayName' | 'bio' | 'avatarUrl'>>): Promise<User | undefined> {
    // Basic validation for avatar URL
    if (profileData.avatarUrl) {
      if (!profileData.avatarUrl.startsWith('http://') && !profileData.avatarUrl.startsWith('https://')) {
        throw new Error("Avatar URL must start with http:// or https://");
      }
      try {
        new URL(profileData.avatarUrl); // Validates URL format
      } catch (e) {
        throw new Error("Invalid Avatar URL format");
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set(profileData)
      .where(eq(users.id, userId))
      .returning();

    return updatedUser || undefined;
  }

  async getThoughts(options: { limit?: number; tag?: string; authorId?: string; search?: string; exclude?: string } = {}): Promise<ThoughtWithAuthor[]> {
    let query = db
      .select({
        thought: thoughts,
        author: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl, // Include avatarUrl
        },
      })
      .from(thoughts)
      .innerJoin(users, eq(thoughts.authorId, users.id))
      .where(eq(thoughts.isPublished, true)) // Default to published
      .orderBy(desc(thoughts.createdAt));

    if (options.authorId) {
      query = query.where(eq(thoughts.authorId, options.authorId));
    }

    const results = await query;

    // Fetch tags for each thought separately
    const thoughtsWithTags = await Promise.all(
      results.map(async (row) => {
        const thoughtTagRows = await db
          .select({ tag: tags })
          .from(thoughtTags)
          .innerJoin(tags, eq(thoughtTags.tagId, tags.id))
          .where(eq(thoughtTags.thoughtId, row.thought.id));

        return {
          ...row.thought,
          author: row.author,
          tags: thoughtTagRows.map((r) => r.tag),
        };
      })
    );

    let filtered = thoughtsWithTags;

    if (options.tag) {
      filtered = filtered.filter((t) => t.tags.some((tag) => tag.slug === options.tag));
    }
    if (options.exclude) {
      filtered = filtered.filter((t) => t.id !== options.exclude);
    }
    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(searchTerm) ||
        t.excerpt?.toLowerCase().includes(searchTerm) ||
        t.content.toLowerCase().includes(searchTerm)
      );
    }
    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  async getThoughtBySlug(slug: string): Promise<ThoughtWithAuthor | undefined> {
    const [result] = await db
      .select({
        thought: thoughts,
        author: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl, // Include avatarUrl
        },
      })
      .from(thoughts)
      .innerJoin(users, eq(thoughts.authorId, users.id))
      .where(eq(thoughts.slug, slug));

    if (!result) return undefined;

    const thoughtTagRows = await db
      .select({ tag: tags })
      .from(thoughtTags)
      .innerJoin(tags, eq(thoughtTags.tagId, tags.id))
      .where(eq(thoughtTags.thoughtId, result.thought.id));

    return {
      ...result.thought,
      author: result.author,
      tags: thoughtTagRows.map((r) => r.tag),
    };
  }

  async getThoughtById(id: string): Promise<ThoughtWithAuthor | undefined> {
    const [result] = await db
      .select({
        thought: thoughts,
        author: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl, // Include avatarUrl
        },
      })
      .from(thoughts)
      .innerJoin(users, eq(thoughts.authorId, users.id))
      .where(eq(thoughts.id, id));

    if (!result) return undefined;

    const thoughtTagRows = await db
      .select({ tag: tags })
      .from(thoughtTags)
      .innerJoin(tags, eq(thoughtTags.tagId, tags.id))
      .where(eq(thoughtTags.thoughtId, result.thought.id));

    return {
      ...result.thought,
      author: result.author,
      tags: thoughtTagRows.map((r) => r.tag),
    };
  }

  async createThought(thought: InsertThought, authorId: string, tagNames: string[]): Promise<ThoughtWithAuthor> {
    const id = randomUUID();
    const excerpt = thought.excerpt || thought.content.slice(0, 200) + (thought.content.length > 200 ? "..." : "");

    const [newThought] = await db.insert(thoughts).values({
      ...thought,
      id,
      authorId,
      excerpt,
    }).returning();

    for (const tagName of tagNames) {
      const tag = await this.getOrCreateTag(tagName);
      await db.insert(thoughtTags).values({
        thoughtId: id,
        tagId: tag.id,
      });
    }

    return (await this.getThoughtById(id))!;
  }

  async updateThought(id: string, thought: Partial<Thought>, tagNames?: string[]): Promise<ThoughtWithAuthor | undefined> {
    const updateData: Record<string, unknown> = { ...thought, updatedAt: new Date() };

    if (thought.content && !thought.excerpt) {
      updateData.excerpt = thought.content.slice(0, 200) + (thought.content.length > 200 ? "..." : "");
    }

    await db.update(thoughts).set(updateData).where(eq(thoughts.id, id));

    if (tagNames !== undefined) {
      await db.delete(thoughtTags).where(eq(thoughtTags.thoughtId, id));
      for (const tagName of tagNames) {
        const tag = await this.getOrCreateTag(tagName);
        await db.insert(thoughtTags).values({
          thoughtId: id,
          tagId: tag.id,
        });
      }
    }

    return this.getThoughtById(id);
  }

  async deleteThought(id: string): Promise<boolean> {
    const result = await db.delete(thoughts).where(eq(thoughts.id, id));
    return result.rowCount !== 0; // Return true if a row was deleted
  }

  async incrementViewCount(id: string): Promise<void> {
    await db
      .update(thoughts)
      .set({ viewCount: sql`${thoughts.viewCount} + 1` })
      .where(eq(thoughts.id, id));
  }

  async getTags(): Promise<Array<Tag & { count: number }>> {
    const allTags = await db.select().from(tags);

    const tagsWithCount = await Promise.all(
      allTags.map(async (tag) => {
        const [countResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(thoughtTags)
          .innerJoin(thoughts, eq(thoughtTags.thoughtId, thoughts.id))
          .where(
            and(
              eq(thoughtTags.tagId, tag.id),
              eq(thoughts.isPublished, true) // Only count published thoughts
            )
          );

        return {
          ...tag,
          count: Number(countResult?.count || 0),
        };
      })
    );

    return tagsWithCount.filter((t) => t.count > 0).sort((a, b) => b.count - a.count);
  }

  async getTagBySlug(slug: string): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.slug, slug));
    return tag || undefined;
  }

  async getOrCreateTag(name: string): Promise<Tag> {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const [existing] = await db.select().from(tags).where(eq(tags.slug, slug));
    if (existing) return existing;

    const [newTag] = await db.insert(tags).values({
      id: randomUUID(), // Generate ID here
      name: name.toLowerCase(),
      slug,
    }).returning();

    return newTag;
  }

  async getStats(authorId?: string): Promise<Stats> {
    let thoughtsQuery = db.select().from(thoughts).where(eq(thoughts.isPublished, true));
    if (authorId) {
      thoughtsQuery = thoughtsQuery.where(eq(thoughts.authorId, authorId));
    }

    const allThoughts = await thoughtsQuery;
    const totalThoughts = allThoughts.length;
    const totalWords = allThoughts.reduce((sum, t) => sum + (t.wordCount || 0), 0); // Handle potential null/undefined wordCount
    const totalViews = allThoughts.reduce((sum, t) => sum + (t.viewCount || 0), 0); // Handle potential null/undefined viewCount

    const tagsWithCount = await this.getTags();
    const totalTags = tagsWithCount.length;

    return {
      totalThoughts,
      totalTags,
      totalWords,
      totalViews,
    };
  }
}

export const storage = new DatabaseStorage();