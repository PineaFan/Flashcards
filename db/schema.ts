import { pgEnum, pgTable, varchar, uuid, primaryKey, timestamp } from 'drizzle-orm/pg-core';

export const cardStatesEnum = pgEnum('card_states_enum', [
    "incorrect",
    "almost",
    "correct"
]);

export const packVisibilityEnum = pgEnum('packVisibility', [
    "public",
    "unlisted",
    "private"
]);


export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    username: varchar('name', { length: 256 }).unique().notNull(),
    displayName: varchar('display_name', { length: 256 }),
    avatar: varchar('avatar'),
    email: varchar('email', { length: 256 }).unique().notNull(),

    discordId: varchar('discord_id', { length: 256 }).unique(),
    googleId: varchar('google_id', { length: 256 }).unique(),
    githubId: varchar('github_id', { length: 256 }).unique(),
    clicksId: varchar('clicks_id', { length: 256 }).unique()
});

export const packs = pgTable('packs', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 256 }).notNull(),
    description: varchar('description', { length: 4096 }),
    colour: varchar('colour', { length: 6 }),
    visibility: packVisibilityEnum('visibility').notNull(),
    owner: uuid('owner').references(() => users.id).notNull(),
    created_at: timestamp('created_at').defaultNow()
});

export const cards = pgTable('cards', {
    id: uuid('id').primaryKey().defaultRandom(),
    prompt: varchar('prompt', { length: 4096 }).notNull(),
    response: varchar('response', { length: 4096 }).notNull(),
    pack: uuid('pack').references(() => packs.id).notNull(),
});


export const cardStates = pgTable('card_states', {
    user: uuid('user_id').references(() => users.id).notNull(),
    card: uuid('card_id').references(() => cards.id).notNull(),
    state: cardStatesEnum('state').notNull(),
}, (table) => {
    return {
        id: primaryKey({ columns: [table.user, table.card] })
    }
});


// export const permissionEnum = pgEnum('permission_enum', [
//     "owner",
//     "edit",
//     "view"
// ]);

// export const savedPacks = pgTable('saved_packs', {
//     user: uuid('user_id').references(() => users.id),
//     pack: uuid('pack_id').references(() => packs.id)
// }, (table) => {
//     return {
//         id: primaryKey({ columns: [table.user, table.pack] })
//     }
// });

// export const packPermissions = pgTable('pack_permissions', {
//     user: uuid('user_id').references(() => users.id),
//     pack: uuid('pack_id').references(() => packs.id),
//     permission: permissionEnum('permission'),
//     accepted: boolean('accepted'),
//     invitedBy: uuid('invited_by').references(() => users.id)
// }, (table) => {
//     return {
//         id: primaryKey({ columns: [table.user, table.pack] })
//     }
// });
