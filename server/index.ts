/*
    @Author: doctorthe113
    @date: 2025-03-17

    @description:
        a http server in bun js from scratch to learn about server side events, sql,
        sqlite, typescript, and how servers work in general

*/

import { Database } from "bun:sqlite";
import type { BunRequest } from "bun";

//*===================================== UTILS ========================================
// message type
type Message = {
    id: number;
    user: string;
    guild: string;
    content: string;
    timestamp: string;
};

// database class with helper functions
class DB {
    db: Database;
    messagesBuffer: Array<Message> = [];
    interval: Timer;

    constructor(path: string) {
        this.db = new Database(path);
        this.db.exec("PRAGMA journal_mode = WAL;");
        // create messages table
        try {
            this.db.run(`CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user TEXT NOT NULL,
                guild TEXT NOT NULL,
                message TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
        } catch (error) {
            console.error(`Error creating table: ${error}`);
        }

        this.interval = setInterval(() => {
            this.insert_to_db();
        }, 10000);
    }

    private async insert_to_db() {
        if (this.messagesBuffer.length === 0) {
            return;
        }

        const insertStatment = this.db.prepare(
            "INSERT INTO messages (user, message) VALUES (?, ?)",
        );

        this.db.transaction(() => {
            this.messagesBuffer.map((msg) => {
                insertStatment.run(msg.user, msg.content);
            });
        })();

        this.messagesBuffer = [];
    }

    upload_message(msg: Message) {
        this.messagesBuffer.push(msg);
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
    const message: Message = {
        id: 0,
        user: user,
        guild: guild,
        content: content,
        timestamp: "",
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

// for handling sending events to clients
async function handle_sse(req: BunRequest) {
    const sseHeaders = {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "Keep-Alive",
        "Access-Control-Allow-Origin": "*",
    };

    // to track of events and messages sent
    let eventId = 0;
    let intervalId: Timer;
    let msgIndex = Math.max(0, db.messagesBuffer.length - 1);

    // stream for sse
    const stream: ReadableStream = new ReadableStream({
        start(controller) {
            const sendUpdate = () => {
                // this makes sure that user only receives new messages after subbing
                if (msgIndex >= db.messagesBuffer.length) {
                    return;
                }
                if (db.messagesBuffer.length === 0) {
                    return;
                }

                const data = db.messagesBuffer[msgIndex];
                const streamData = `id: ${eventId}\ndata: ${data.content}\n\n`;
                eventId++;
                msgIndex++;

                controller.enqueue(
                    new TextEncoder().encode(streamData),
                );
            };

            // timer to send updates every 200 ms
            intervalId = setInterval(sendUpdate, 200);
        },
        cancel() {
            clearInterval(intervalId);
            console.log("Stream cancelled");
        },
    });

    return new Response(stream, { headers: sseHeaders });
}

//*=============================== SERVER RELATED =====================================
// starts server
const server = Bun.serve({
    port: 3000,
    idleTimeout: 0,
    routes: {
        "/send/": handle_new_message,
        "/events": handle_sse,
    },
});

console.log(`Listening on http://localhost:${server.port}`);
