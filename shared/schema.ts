import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(), // ✅ removed .default(sql`gen_random_uuid()`)
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const thoughts = pgTable("thoughts", {
  id: varchar("id", { length: 36 }).primaryKey(), // ✅ removed .default(sql`gen_random_uuid()`)
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  readingTime: integer("reading_time").default(1).notNull(),
  wordCount: integer("word_count").default(0).notNull(),
  authorId: varchar("author_id", { length: 36 }).references(() => users.id).notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: varchar("id", { length: 36 }).primaryKey(), // ✅ removed .default(sql`gen_random_uuid()`)
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const thoughtTags = pgTable("thought_tags", {
  thoughtId: varchar("thought_id", { length: 36 }).references(() => thoughts.id, { onDelete: "cascade" }).notNull(),
  tagId: varchar("tag_id", { length: 36 }).references(() => tags.id, { onDelete: "cascade" }).notNull(),
});

// Relations (unchanged)
export const usersRelations = relations(users, ({ many }) => ({
  thoughts: many(thoughts),
}));

export const thoughtsRelations = relations(thoughts, ({ one, many }) => ({
  author: one(users, {
    fields: [thoughts.authorId],
    references: [users.id],
  }),
  thoughtTags: many(thoughtTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  thoughtTags: many(thoughtTags),
}));

export const thoughtTagsRelations = relations(thoughtTags, ({ one }) => ({
  thought: one(thoughts, {
    fields: [thoughtTags.thoughtId],
    references: [thoughts.id],
  }),
  tag: one(tags, {
    fields: [thoughtTags.tagId],
    references: [tags.id],
  }),
}));

// Schemas (unchanged)
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  isAdmin: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username too long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().optional(),
});

export const insertThoughtSchema = createInsertSchema(thoughts).omit({
  id: true,
  authorId: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
});

// Type exports (already correct)
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertThought = z.infer<typeof insertThoughtSchema>;
export type Thought = typeof thoughts.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;
export type ThoughtTag = typeof thoughtTags.$inferSelect;

export type ThoughtWithAuthor = Thought & {
  author: Pick<User, "id" | "username" | "displayName" | "avatarUrl">;
  tags: Tag[];
};

export type Stats = {
  totalThoughts: number;
  totalTags: number;
  totalWords: number;
  totalViews: number;
};