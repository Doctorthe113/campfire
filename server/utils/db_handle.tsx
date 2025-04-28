import { Database } from "bun:sqlite";
import is_valid_uuidv7 from "./uuid_validator";

type Message = {
    id: string;
    author_id: string;
    author_name: string;
    guild: string;
    content: string;
    created_at: string;
};

type User = {
    id: string;
    username: string;
    email: string;
    password: string;
    avatar: string | Uint8Array;
    created_at: string;
};

type Guild = {
    id: string;
    name: string;
    owner: string;
    avatar: string | Uint8Array;
    created_at: string;
};

type GuildUsers = {
    user_id: string;
    guild_id: string;
};

type UUID = string;

export default class DB {
    db: Database;
    messagesBuffer: Array<Message> = [];
    interval: Timer;

    constructor(path: string) {
        this.db = new Database(path);
        this.db.exec("PRAGMA journal_mode = WAL;");
        try {
            this.db.exec(
                `
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT UNIQUE PRIMARY KEY NOT NULL,
                    created_at DATETIME,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    avatar TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS messages (
                    id TEXT UNIQUE PRIMARY KEY NOT NULL,
                    created_at DATETIME,
                    author_id TEXT NOT NULL,
                    author_name TEXT NOT NULL,
                    guild TEXT NOT NULL,
                    content TEXT NOT NULL,
                    FOREIGN KEY (author_id) REFERENCES users(id)
                );
                CREATE TABLE IF NOT EXISTS guilds (
                    id TEXT UNIQUE PRIMARY KEY NOT NULL,
                    created_at DATETIME,
                    name TEXT NOT NULL,
                    owner TEXT NOT NULL,
                    avatar TEXT NOT NULL,
                    FOREIGN KEY (owner) REFERENCES users(id)
                );
                CREATE TABLE IF NOT EXISTS guild_users (
                    user_id TEXT NOT NULL,
                    guild_id TEXT NOT NULL,
                    PRIMARY KEY (user_id, guild_id),
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (guild_id) REFERENCES guilds(id)
                );
                `,
            );
        } catch (error) {
            console.error(`Error creating table: ${error}`);
        }

        // to insert messages into the db
        this.interval = setInterval(() => {
            this.insert_to_db();
        }, 10000);
    }

    //* message related db methods
    upload_message(msg: Message) {
        this.messagesBuffer.push(msg);
    }

    // insert messages to database perodically
    insert_to_db() {
        if (this.messagesBuffer.length === 0) {
            return;
        }

        const insertStatment = this.db.prepare(
            "INSERT INTO messages (id, author_id, author_name, guild, content, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        );

        this.db.transaction(() => {
            this.messagesBuffer.map((msg) => {
                insertStatment.run(
                    msg.id,
                    msg.author_id,
                    msg.author_name,
                    msg.guild,
                    msg.content,
                    msg.created_at,
                );
            });
        })();

        this.messagesBuffer = [];
    }

    get_message(
        id: UUID = "",
        guildId: UUID = "",
        author_id: UUID = "",
        author_name: string = "",
        content: string = "",
    ) {
        const checkStatment = this.db.prepare(`
            SELECT * FROM messages
            WHERE id = ? OR guild = ? OR author_id = ? OR author_name = ? OR content = ?
        `);
        return checkStatment.all(
            id,
            guildId,
            author_id,
            author_name,
            content,
        ) as Message[];
    }

    delete_message(id: UUID, author_id: string) {
        const message: Message = this.get_message(id = id)[0];

        if (message.author_id !== author_id) {
            return false;
        }

        const deleteStatment = this.db.prepare(
            "DELETE FROM messages WHERE id = ?",
        );
        if (deleteStatment.run(id).changes === 1) {
            return true;
        }
        return false;
    }

    edit_message(id: UUID, author_id: string, content: string) {
        const message: Message = this.get_message(id = id)[0];

        if (message.author_id !== author_id) {
            console.log(message.author_id, author_id);

            return false;
        }

        const editStatment = this.db.prepare(
            "UPDATE messages SET content = ? WHERE id = ?",
        );
        if (editStatment.run(content, id).changes === 1) {
            return true;
        }
        return false;
    }

    // gets a list of 50 latest messages in a guild
    get_old_messages(guildId: UUID, page: number, pageSize: number = 50) {
        if (is_valid_uuidv7(guildId) === false) {
            return [];
        }

        if (typeof page !== "number" || typeof pageSize !== "number") {
            return [];
        }

        const getMessagesStatement = this.db.query(`
                    SELECT
                        m.id, m.author_id, m.author_name, m.guild, m.content, m.created_at, u.avatar
                    FROM
                        messages m
                    JOIN
                        users u ON u.id = m.author_id
                    WHERE
                        m.guild = ?
                    ORDER BY
                        m.created_at DESC
                    LIMIT ?
                    OFFSET ?;
            `);

        const offset = (page - 1) * pageSize;
        const messages = getMessagesStatement.all(guildId, pageSize, offset);
        return messages.reverse();
    }

    //* user related db methods
    create_user(user: User) {
        const insertStatment = this.db.prepare(
            "INSERT INTO users (id, username, email, password, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        );
        insertStatment.run(
            user.id,
            user.username,
            user.email,
            user.password,
            user.avatar,
            user.created_at,
        );
    }

    // todo: make it accept all or any changes
    update_user(user: User) {
        const updateStatment = this.db.prepare(
            "UPDATE users SET username = ?, email = ?, password = ?, avatar = ? WHERE id = ?",
        );
        updateStatment.run(
            user.username,
            user.email,
            user.password,
            user.avatar,
            user.id,
        );
    }

    get_user(email: string) {
        const checkStatment = this.db.prepare(
            "SELECT * FROM users WHERE email = ?",
        );
        return checkStatment.get(email) as User;
    }

    //* guild related db methods
    get_guild(guildId: UUID) {
        if (is_valid_uuidv7(guildId) === false) {
            return false;
        }
        const queryStatement = this.db.prepare(
            "SELECT * FROM guilds WHERE id = ?",
        );
        return queryStatement.get(guildId);
    }

    create_guild(guild: Guild) {
        const createStatment = this.db.prepare(
            "INSERT INTO guilds (id, name, owner, avatar, created_at) VALUES (?, ?, ?, ?, ?)",
        );
        const joinStatment = this.db.prepare(
            "INSERT INTO guild_users (user_id, guild_id) VALUES (?, ?)",
        );

        this.db.transaction(() => {
            createStatment.run(
                guild.id,
                guild.name,
                guild.owner,
                guild.avatar,
                guild.created_at,
            );
            joinStatment.run(guild.owner, guild.id);
        })();
    }

    // checks if a guild exists then gets its name
    join_guild(data: GuildUsers) {
        const getGuild = this.get_guild(data.guild_id);

        if (getGuild === false) {
            throw new Error("Guild does not exist");
        }

        const insertStatment = this.db.prepare(
            "INSERT INTO guild_users (user_id, guild_id) VALUES (?, ?)",
        );
        insertStatment.run(
            data.user_id,
            data.guild_id,
        );
    }

    // validates if a user is in a guild
    check_user_is_in_guild(data: GuildUsers) {
        if (is_valid_uuidv7(data.user_id) === false) {
            return false;
        }

        const checkStatment = this.db.prepare(
            "SELECT * FROM guild_users WHERE user_id = ? AND guild_id = ?",
        );

        return Boolean(checkStatment.get(data.user_id, data.guild_id));
    }

    // gets a list of all the users in a guild
    get_all_users_in_guild(guildId: UUID) {
        if (is_valid_uuidv7(guildId) === false) {
            return [];
        }

        const getGuildUsersStatement = this.db.query(`
            SELECT users.*
            FROM guild_users
            INNER JOIN users ON guild_users.user_id = users.id
            WHERE guild_id = ?
        `);

        return getGuildUsersStatement.all(guildId);
    }

    // gets a list of all the guilds a user is in
    get_all_guilds_of_user(userId: UUID) {
        if (is_valid_uuidv7(userId) === false) {
            return [];
        }

        const getGuildsStatement = this.db.query(`
            SELECT guilds.*
            FROM guild_users
            INNER JOIN guilds ON guild_users.guild_id = guilds.id
            WHERE user_id = ?
        `);

        return getGuildsStatement.all(userId);
    }

    close_db() {
        this.db.close();
        clearInterval(this.interval);
    }
}
