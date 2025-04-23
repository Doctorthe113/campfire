/*
    @Author: doctorthe113
    @date: 2025-03-17

    @description:
        a http server in bun js from scratch to learn about server side events, sql,
        sqlite, typescript, and how servers work in general

*/

import { Database } from "bun:sqlite";
import type { BunRequest } from "bun";
import { randomUUIDv7 } from "bun";

//*===================================== TYPES ========================================
// message type
type Message = {
    id: string;
    user: string;
    guild: string;
    content: string;
    timestamp: string;
};

type User = {
    id: string;
    username: string;
    guilds_in: string;
    created_at: string;
};
//*===================================== UTILS ========================================

function isValidUUIDv7(uuid: string) {
    const uuidv7Regex =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    return uuidv7Regex.test(uuid);
}

// database class with helper functions
class DB {
    db: Database;
    messagesBuffer: Array<Message> = [];
    interval: Timer;

    // initialize database and starts the timer
    constructor(path: string) {
        this.db = new Database(path);
        this.db.exec("PRAGMA journal_mode = WAL;");
        try {
            // Create users table
            this.db.run(`CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY NOT NULL,
                username TEXT NOT NULL,
                guilds_in TEXT
                created_at DATETIME
            )`);

            // Create messages table with foreign key constraint
            this.db.run(`CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY NOT NULL,
                user_id TEXT NOT NULL,
                guild TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp DATETIME,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`);
        } catch (error) {
            console.error(`Error creating table: ${error}`);
        }

        this.interval = setInterval(() => {
            this.insert_to_db();
        }, 10000);
    }

    // insert messages to database perodically
    private async insert_to_db() {
        if (this.messagesBuffer.length === 0) {
            return;
        }

        const insertStatment = this.db.prepare(
            "INSERT INTO messages (id, user, guild, content, timestamp) VALUES (?, ?, ?, ?, ?)"
        );

        this.db.transaction(() => {
            this.messagesBuffer.map((msg) => {
                insertStatment.run(
                    msg.id,
                    msg.user,
                    msg.guild,
                    msg.content,
                    msg.timestamp
                );
            });
        })();

        this.messagesBuffer = [];
    }

    // add message to buffer, exposed to the pub
    upload_message(msg: Message) {
        this.messagesBuffer.push(msg);
    }

    // get old messages from database, exposed to the pub
    async get_messages(guild: string, page: number, pageSize: number = 50) {
        if (isValidUUIDv7(guild) === false) {
            return [];
        }

        const getMessagesStatement = this.db.query(`
            SELECT id, user, guild, content, timestamp
            FROM messages
            WHERE guild = ?
            ORDER BY timestamp DESC
            LIMIT ?
            OFFSET ?
        `);

        const offset = (page - 1) * pageSize;
        const messages = getMessagesStatement.all(guild, pageSize, offset);
        return messages.reverse();
    }

    // get user info from database
    async get_user(user: string) {
        if (isValidUUIDv7(user) === false) {
            return null;
        }

        const getUserStatement = this.db.query(`
            SELECT id, username, guilds_in, created_at
            FROM users
            WHERE id = ?
        `);
        return getUserStatement.get(user);
    }

    close_db() {
        this.db.close();
        clearInterval(this.interval);
    }
}

// initialize database
const db = new DB("./db/chatapp.sqlite");

//*=============================== HANDLER FUNCTIONS ==================================
// for handling new message inputs
async function handle_new_message(req: BunRequest) {
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }

    const { user, guild, content } = await req.json();
    const id: string = randomUUIDv7();
    const timestamp: string = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
    const message: Message = {
        id: id,
        user: user,
        guild: guild,
        content: content,
        timestamp: timestamp,
    };
    db.upload_message(message);

    return new Response(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
        },
    });
}

// for handling getting messages from database
async function handle_get_messages(req: BunRequest) {
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }

    const { page, pageSize, guild } = await req.json();

    const messages = await db.get_messages(guild, page, pageSize);
    return new Response(JSON.stringify(messages));
}

// for handling getting user info from database
async function handle_get_user(req: BunRequest) {
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }

    const { userId } = await req.json();

    const user_info = await db.get_user(userId);
    return new Response(JSON.stringify(user_info));
}

// for handling sending events to clients
async function handle_sse(req: BunRequest) {
    const sseHeaders = {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "Keep-Alive",
        "Access-Control-Allow-Origin": "*",
    };

    // get guild id from the url
    const guildId = req.url.split("/").pop();

    // to track of events and messages sent
    let intervalId: Timer;
    let msgIndex = Math.max(0, db.messagesBuffer.length - 1);

    // stream for sse
    const stream: ReadableStream = new ReadableStream({
        start(controller) {
            const sendUpdate = () => {
                if (db.messagesBuffer.length === 0) {
                    msgIndex = 0;

                    return;
                }

                while (msgIndex <= db.messagesBuffer.length - 1) {
                    const data: Message = db.messagesBuffer[msgIndex];

                    // this makes sure that user only receives messages for the guild
                    if (guildId !== data.guild) {
                        msgIndex++;
                        return;
                    }

                    const streamData = `data: ${JSON.stringify(data)}\n\n`;
                    msgIndex++;

                    controller.enqueue(new TextEncoder().encode(streamData));
                }
            };

            // timer to send updates every 50 ms
            intervalId = setInterval(sendUpdate, 50);
        },
        cancel() {
            clearInterval(intervalId);
        },
    });

    return new Response(stream, { headers: sseHeaders });
}

//*=============================== SERVER RELATED =====================================
// starts server
const server = Bun.serve({
    port: 5000,
    idleTimeout: 0,
    routes: {
        "/send/": handle_new_message,
        "/events/:guildId": handle_sse,
        "/receive/": handle_get_messages,
        "/user/": handle_get_user,
    },
});

console.log(`Listening on http://localhst:${server.port}`);
