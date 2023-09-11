import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import type { AdapterAccount } from "next-auth/adapters";


export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  created_at: timestamp('created_at').notNull().defaultNow(),
  hashedPassword: text('hashed_password'),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  })
);

export const chats = pgTable("chats", {
  id: uuid('id').default(sql`gen_random_uuid()`).notNull().primaryKey(),
  isGroup: boolean('is_group').default(false).notNull(),
  name: text('name'),
  image: text('image'),
  description: text('description'),
  created_at: timestamp('created_at').notNull().defaultNow(),
})

export const invites = pgTable("invites", {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull().default(sql`CURRENT_TIMESTAMP + interval '14 days'`),
  code:  uuid('id').default(sql`gen_random_uuid()`),
  inviterId: integer('inviter_id').notNull().references(() => members.id),
  invitedId: text('invited_id').references(() => users.id),
}, (t) => ({
  unq: unique().on(t.inviterId, t.createdAt),
}))

export const invitesRelations = relations(invites, ({one}) => ({
  inviter: one(members, {
    fields: [invites.inviterId],
    references: [members.id],
  }),
  invited: one(users, {
    fields: [invites.invitedId],
    references: [users.id],
  })
}))

export const chatsRelations = relations(chats, ({many}) => ({
  members: many(members),
  messages: many(messages),
}))

export const messages = pgTable("messages", {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  content: text('content'),
  memberId: integer('member_id').notNull().references(() => members.id),
  chatId: uuid('chat_id').notNull().references(() => chats.id),
  updatedAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  unq: unique().on(t.createdAt, t.memberId),
}))

export const messageFiles = pgTable("message_files", {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  key: text('key').notNull(),
  name: text('name').notNull(),
  messageId: integer('message_id').notNull().references(() => messages.id),
}, (t) => ({
  unq: unique().on(t.key, t.name),
}))

export const messageFilesRelations = relations(messageFiles, ({one}) => ({
  message: one(messages, {
    fields: [messageFiles.messageId],
    references: [messages.id],
  })
}))

export const messagesRelations = relations(messages, ({one, many}) => ({
  member: one(members, {
    fields: [messages.memberId],
    references: [members.id],
  }),
  seenMessages: many(seenMessages),
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],    
  }),
  messageFiles: many(messageFiles)
}))

export const members = pgTable("members", {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  userId: text('user_id').notNull().references(() => users.id),
  chatId: uuid('chat_id').notNull().references(() => chats.id),
  isAdministrator: boolean('is_administrator'),
  isRemoved: boolean('is_removed').default(false),
}, (t) => ({
  unq: unique().on(t.userId, t.chatId),
}))

export const usersRelations = relations(users, ({many}) => ({
  members: many(members),
  invites: many(invites),
}))

export const membersRelations = relations(members, ({many, one}) => ({
  messages: many(messages),
  seenMessages: many(seenMessages),
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
  chat: one(chats, {
    fields: [members.chatId],
    references: [chats.id],
  }),
  invites: many(invites),
}))

export const seenMessages = pgTable("seen_messages", {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  messageId: integer('message_id').notNull().references(() => messages.id),
  memberId: integer('member_id').notNull().references(() => members.id),
}, (t) => ({
  unq: unique().on(t.messageId, t.memberId),
}))

export const seenMessagesRelations = relations(seenMessages, ({one}) => ({
  message: one(messages, {
    fields: [seenMessages.messageId],
    references: [messages.id],
  }),
  member: one(members, {
    fields: [seenMessages.memberId],
    references: [members.id],
  }),
}))