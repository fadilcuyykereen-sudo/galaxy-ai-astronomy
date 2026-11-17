import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => chatSessions.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  topic: text("topic"),
  suggestions: jsonb("suggestions").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const generatedImages = pgTable("generated_images", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  enhancedPrompt: text("enhanced_prompt").notNull(),
  style: text("style").notNull(),
  aspectRatio: text("aspect_ratio").notNull().default("1:1"),
  seed: integer("seed").notNull(),
  imageUrl: text("image_url").notNull(),
  isFavorite: boolean("is_favorite").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const celestialBodies = pgTable("celestial_bodies", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  englishName: text("english_name").notNull(),
  catalogCode: text("catalog_code").notNull(),
  category: text("category").notNull(), // 'star' | 'planet' | 'galaxy'
  classification: text("classification").notNull(),
  mass: text("mass").notNull(),
  massKg: text("mass_kg").notNull(),
  massComparison: text("mass_comparison").notNull(),
  diameter: text("diameter").notNull(),
  distance: text("distance").notNull(),
  gravity: text("gravity"),
  rotationPeriod: text("rotation_period"),
  rotationDirection: text("rotation_direction"),
  rotationSpeed: text("rotation_speed"),
  orbitalPeriod: text("orbital_period"),
  orbitalSpeed: text("orbital_speed"),
  axialTilt: text("axial_tilt"),
  temperature: text("temperature"),
  moonsCount: text("moons_count"),
  atmosphere: text("atmosphere"),
  starCount: text("star_count"),
  age: text("age"),
  constellation: text("constellation"),
  centralBlackHole: text("central_black_hole"),
  radialVelocity: text("radial_velocity"),
  colorHex: text("color_hex").notNull(),
  summary: text("summary").notNull(),
  rotationInsight: text("rotation_insight"),
  facts: jsonb("facts").$type<string[]>().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  celestialSlug: text("celestial_slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  soundEnabled: boolean("sound_enabled").notNull().default(true),
  ambientEnabled: boolean("ambient_enabled").notNull().default(false),
  defaultOrbitSpeed: text("default_orbit_speed").notNull().default("1"),
  missionScore: integer("mission_score").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type GeneratedImage = typeof generatedImages.$inferSelect;
export type CelestialBody = typeof celestialBodies.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
export type UserPreference = typeof userPreferences.$inferSelect;
