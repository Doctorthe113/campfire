import { randomUUIDv7 } from "bun";
import type { BunRequest } from "bun";
import { password as pass } from "bun";
import { jwtVerify, SignJWT } from "jose";
import Database from "./utils/db_handle";

const serverEnv = Bun.env.NODE_ENV;
let clientDomain = "";
if (serverEnv === "development") {
    console.log("Development environment detected");
    clientDomain = "localhost";
} else {
    clientDomain = "campfire.doctorthe113.com";
}

//*===================================== TYPES ========================================
// message type
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

type GuildEvent = {
    eventType: "delete" | "edit";
    guildId: string;
    id: string;
    content: string | null;
};

//*======================================= Utils ========================================
function create_jwt(userEmail: string, userId: string) {
    try {
        const encoder = new TextEncoder();
        const secretKey = encoder.encode(Bun.env.JWT_KEY);

        const jwt = new SignJWT({ email: userEmail, id: userId })
            .setIssuedAt()
            .setProtectedHeader({ alg: "HS256" })
            .sign(secretKey);

        return jwt;
    } catch (error) {
        console.log("Error creating JWT:", error);
        throw error;
    }
}

async function verify_jwt(token: string) {
    try {
        const encoder = new TextEncoder();
        const secretKey = encoder.encode(Bun.env.JWT_KEY);

        const { payload, protectedHeader } = await jwtVerify(token, secretKey, {
            algorithms: ["HS256"],
        });

        return payload;
    } catch (error) {
        console.log("Error verifying JWT:", error);
        throw error;
    }
}

async function verify_auth(req: BunRequest) {
    //@ts-expect-error
    const cookies = req.cookies;

    const token = cookies.get("session") as string;
    const userId = cookies.get("user_id") as string;
    const email = cookies.get("user_email") as string;

    const payload = await verify_jwt(token);

    if (payload.id == userId && payload.email == email) {
        return true;
    } else {
        return false;
    }
}

function handle_preflight(origin: string) {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": origin,
        },
    });
}

function corsResponse(
    origin: string,
    message: string | object | null,
    status: number,
) {
    if (typeof message === "object") {
        message = JSON.stringify(message);
    }
    return new Response(message as string, {
        status: status,
        headers: {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}

const connectedWsClients = new Set<WebSocket>();
//*==================================== DATABASE ========================================
// initialize database
const db = new Database("./db/chatapp.sqlite");
//*================================= REQUEST HANDLER ====================================

// this is connected to the websocket handlers so need to make it async i think
function handle_msg_upload(msg: any) {
    const id: string = randomUUIDv7();
    const timestamp: string = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
    const message: Message = {
        id: id,
        author_id: msg.author_id,
        author_name: msg.author_name,
        guild: msg.guild,
        content: msg.content,
        created_at: timestamp,
    };

    db.upload_message(message);

    return { ...message, "avatar": msg.avatar };
}

// get - has auth
async function handle_get_messages(req: BunRequest) {
    const origin = req.headers.get("Origin") as string;

    const isAuthenticated = await verify_auth(req);
    if (!isAuthenticated) {
        return corsResponse(origin, "Unauthorized", 401);
    }

    const url = new URL(req.url);
    const guildId = url.searchParams.get("guild_id") as string;
    const page = url.searchParams.get("page") as string || "1";
    const pageSize = url.searchParams.get("page_size") as string || "50";

    const messages = db.get_old_messages(
        guildId,
        Number(page),
        Number(pageSize),
    );

    return corsResponse(origin, messages, 200);
}

// get - has auth
async function handle_ws(req: BunRequest) {
    const origin = req.headers.get("Origin") as string;

    const isAuthenticated = await verify_auth(req);
    if (!isAuthenticated) {
        return corsResponse(origin, "Unauthorized", 401);
    }

    const url = new URL(req.url);
    const guildId = url.searchParams.get("guild_id") as string;
    const userId = url.searchParams.get("user_id") as string;

    if (!db.check_user_is_in_guild({ user_id: userId, guild_id: guildId })) {
        return corsResponse("*", "User is not in guild", 403);
    }

    if (
        server.upgrade(req, {
            data: {
                guild_id: guildId,
                user_id: userId,
            },
        })
    ) {
    }
    return corsResponse("*", "ws failed", 200);
}

// post
async function handle_login(req: BunRequest) {
    const origin = req.headers.get("Origin") as string;

    // preflight
    if (req.method === "OPTIONS") {
        return handle_preflight(origin);
    }

    // @ts-ignore
    const cookies = req.cookies;

    const { email, password } = await req.json();

    // gets user information
    const user: User = db.get_user(email);

    // early return
    if (!Boolean(user)) {
        return corsResponse(origin, "User does not exist", 404);
    }

    // checks password hash
    const isPasswordValid = await pass.verify(password, user.password);

    if (!isPasswordValid) {
        return corsResponse(origin, "Invalid password", 401);
    }

    // create jwt, set cookie, and return
    const token = await create_jwt(user.email, user.id);
    cookies.set("session", token, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        path: "/",
        expires: new Date(Date.now() + 86400000),
        sameSite: "none",
        secure: true,
        domain: clientDomain,
    });
    cookies.set("user_id", user.id, {
        sameSite: "none",
        path: "/",
        expires: new Date(Date.now() + 86400000),
        httpOnly: true,
        secure: true,
        domain: clientDomain,
    });
    cookies.set("user_email", user.email, {
        sameSite: "none",
        path: "/",
        expires: new Date(Date.now() + 86400000),
        httpOnly: true,
        secure: true,
        domain: clientDomain,
    });
    cookies.set("username", user.username, {
        sameSite: "none",
        path: "/",
        expires: new Date(Date.now() + 86400000),
        httpOnly: true,
        secure: true,
        domain: clientDomain,
    });

    return corsResponse(origin, null, 200);
}

// post
async function handle_register(req: BunRequest) {
    const origin = req.headers.get("Origin") as string;

    // preflight
    if (req.method === "OPTIONS") {
        return handle_preflight(origin);
    }

    // @ts-ignore
    const cookies = req.cookies;
    const { username, email, password } = await req.json();

    // hashes the password
    const hashedPassword = await pass.hash(password);

    // get avatar from dicebear
    const avatarRes = await fetch(
        `https://api.dicebear.com/9.x/adventurer/webp?seed=${username}&earrings=variant02,variant03,variant04,variant05,variant06,variant01&earringsProbability=30&eyebrows=variant01,variant02,variant03,variant04,variant05,variant06,variant08,variant09,variant10,variant11,variant12,variant13,variant14,variant15,variant07&eyes=variant01,variant02,variant03,variant04,variant05,variant07,variant08,variant09,variant10,variant11,variant12,variant13,variant14,variant15,variant16,variant17,variant18,variant19,variant20,variant21,variant22,variant23,variant24,variant25,variant26,variant06&featuresProbability=20&glasses=variant02,variant03,variant04,variant05,variant01&glassesProbability=25&hair=long02,long03,long04,long05,long06,long07,long08,long09,long10,long11,long12,long13,long14,long15,long16,long17,long18,long19,long20,long21,long22,long23,long24,long25,long26,short01,short02,short03,short04,short05,short06,short07,short08,short09,short10,short11,short12,short13,short14,short15,short16,short17,short18,short19,long01&hairColor=3eac2c,562306,592454,6a4e35,796a45,85c2c6,ab2a18,ac6511,afafaf,b9a05f,cb6820,dba3be,e5d7a3,0e0e0e&mouth=variant01,variant02,variant03,variant04,variant05,variant06,variant08,variant09,variant10,variant11,variant12,variant13,variant14,variant15,variant16,variant17,variant18,variant19,variant20,variant21,variant22,variant23,variant24,variant25,variant26,variant27,variant28,variant29,variant30,variant07&backgroundColor=ffdfbf,d1d4f9,b6e3f4`,
    );

    const avatarArray = await avatarRes.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(avatarArray));
    const base64String = buffer.toString(
        "base64",
    );
    const avatarUrl = `data:"image/webp";base64,${base64String}`;

    // user object
    const user: User = {
        id: randomUUIDv7(),
        username: username,
        email: email,
        password: hashedPassword,
        avatar: avatarUrl,
        created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
    };

    try {
        db.create_user(user);
        const token = await create_jwt(user.email, user.id);
        cookies.set("session", token, {
            maxAge: 60 * 60 * 24 * 7,
            httpOnly: true,
            path: "/",
            expires: new Date(Date.now() + 86400000),
            sameSite: "none",
            secure: true,
            domain: clientDomain,
        });
        cookies.set("user_id", user.id, {
            sameSite: "none",
            path: "/",
            expires: new Date(Date.now() + 86400000),
            httpOnly: true,
            secure: true,
            domain: clientDomain,
        });
        cookies.set("user_email", user.email, {
            sameSite: "none",
            path: "/",
            expires: new Date(Date.now() + 86400000),
            httpOnly: true,
            secure: true,
            domain: clientDomain,
        });
        cookies.set("username", user.username, {
            sameSite: "none",
            path: "/",
            expires: new Date(Date.now() + 86400000),
            httpOnly: true,
            secure: true,
            domain: clientDomain,
        });

        return corsResponse(origin, "User created", 200);
    } catch (error) {
        console.log(error);
        return corsResponse(origin, "User already exists", 400);
    }
}

// get - nextjs
async function handle_get_user(req: BunRequest) {
    if (
        !(req.url.startsWith("http://127.0.0.1") ||
            req.url.startsWith("https://127.0.0.1"))
    ) {
        return corsResponse("*", "Unauthorized", 401);
    }

    const email = new URL(req.url).searchParams.get("user_email") as string;
    const user = db.get_user(email);

    return corsResponse("*", user, 200);
}

// get - validates the token for nextjs
async function handle_validate_auth(req: BunRequest) {
    const origin = req.headers.get("Origin") as string;

    if (
        !(req.url.startsWith("http://127.0.0.1") ||
            req.url.startsWith("https://127.0.0.1"))
    ) {
        return corsResponse(origin, "Unauthorized", 401);
    }

    const url = new URL(req.url);
    const token = url.searchParams.get("token") as string;
    const userId = url.searchParams.get("user_id") as string;
    const email = url.searchParams.get("user_email") as string;

    if (!db.get_user(email)) {
        return corsResponse(origin, "User does not exist", 404);
    }

    const payload = await verify_jwt(token);

    if (payload.id == userId && payload.email == email) {
        return corsResponse(origin, "Token is valid", 200);
    } else {
        return corsResponse(origin, "Token is invalid", 403);
    }
}

// get - for checking if user is in guild - for nextjs
async function handle_check_user_is_in_guild(req: BunRequest) {
    const origin = req.headers.get("Origin") as string;

    if (
        !(req.url.startsWith("http://127.0.0.1") ||
            req.url.startsWith("https://127.0.0.1"))
    ) {
        return corsResponse(origin, "Unauthorized", 401);
    }

    const url = new URL(req.url);
    const user_id = url.searchParams.get("user_id") as string;
    const guild_id = url.searchParams.get("guild_id") as string;

    const isUserInGuild = db.check_user_is_in_guild({
        user_id: user_id,
        guild_id: guild_id,
    });

    if (!isUserInGuild) {
        return corsResponse(origin, "User is not in guild", 403);
    }

    return corsResponse(origin, "User is in guild", 200);
}

// post - has auth
async function handle_create_guild(req: BunRequest) {
    const origin = req.headers.get("Origin") as string;

    // preflight
    if (req.method === "OPTIONS") {
        return handle_preflight(origin);
    }

    const isAuthenticated = await verify_auth(req);
    if (!isAuthenticated) {
        return corsResponse(origin, "User is not authenticated", 403);
    }

    // @ts-ignore
    const owner = req.cookies.get("user_id") as string;
    const { guild_name } = await req.json();

    // get avatar from dicebear
    const avatarRes = await fetch(
        `https://api.dicebear.com/9.x/adventurer-neutral/webp?seed=${guild_name}&backgroundColor=763900,9e5622,ecad80,ffdfbf&eyebrows=variant02,variant03,variant04,variant05,variant06,variant07,variant08,variant09,variant10,variant11,variant12,variant13,variant14,variant15,variant01&eyes=variant02,variant03,variant04,variant05,variant06,variant07,variant08,variant09,variant10,variant11,variant12,variant13,variant14,variant15,variant16,variant17,variant18,variant19,variant20,variant21,variant22,variant23,variant24,variant25,variant26,variant01&glasses=variant02,variant03,variant04,variant01,variant05&glassesProbability=30&mouth=variant01,variant02,variant03,variant04,variant05,variant08,variant09,variant10,variant11,variant12,variant13,variant14,variant15,variant16,variant17,variant18,variant19,variant20,variant21,variant22,variant23,variant24,variant25,variant26,variant27,variant28,variant29,variant30,variant06,variant07`,
    );

    const avatarArray = await avatarRes.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(avatarArray));
    const base64String = buffer.toString(
        "base64",
    );
    const avatarUrl = `data:"image/webp";base64,${base64String}`;

    const guild: Guild = {
        id: randomUUIDv7(),
        name: guild_name,
        owner: owner,
        avatar: avatarUrl,
        created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
    };

    const guildExists = db.get_guild(guild.id);

    if (Boolean(guildExists)) {
        return corsResponse(origin, "Guild already exists", 400);
    }

    db.create_guild(guild);
    return corsResponse(origin, guild.id, 200);
}

// get - has auth
async function handle_join_guild(req: BunRequest) {
    const origin = req.headers.get("Origin") as string;

    if (
        req.url.startsWith("https://127.0.0.1") ||
        req.url.startsWith("http://127.0.0.1")
    ) {
        const url = new URL(req.url);
        const guildId = url.searchParams.get("guild_id") as string;
        const userId = url.searchParams.get("user_id") as string;

        try {
            db.join_guild({ user_id: userId, guild_id: guildId });
            return corsResponse(origin, "Joined guild", 200);
        } catch (error) {
            return corsResponse(origin, error as string, 403);
        }
    }

    const isAuthenticated = await verify_auth(req);
    if (!isAuthenticated) {
        return corsResponse(origin, "User is not authenticated", 403);
    }

    const url = new URL(req.url);
    const guildId = url.searchParams.get("guild_id") as string;

    //@ts-ignore
    const userId = req.cookies.get("user_id") as string;

    try {
        db.join_guild({ user_id: userId, guild_id: guildId });
        return corsResponse(origin, "Joined guild", 200);
    } catch (error) {
        return corsResponse(origin, "Failed to join guild", 403);
    }
}

// get - nextjs
async function handle_get_guild(req: BunRequest) {
    const origin = req.headers.get("Origin") as string;

    if (
        !(req.url.startsWith("http://127.0.0.1") ||
            req.url.startsWith("https://127.0.0.1"))
    ) {
        return corsResponse(origin, "Unauthorized", 401);
    }

    const url = new URL(req.url);
    const guildId = url.searchParams.get("guild_id") as string;

    const guild = db.get_guild(guildId) as Guild;

    if (!guild) {
        return corsResponse(origin, "Guild does not exist", 404);
    }

    return corsResponse(origin, guild, 200);
}

// get- for nextjs
async function handle_get_user_guilds(req: BunRequest) {
    const origin = req.headers.get("Origin") as string;

    if (
        !(req.url.startsWith("http://127.0.0.1") ||
            req.url.startsWith("https://127.0.0.1"))
    ) {
        return corsResponse(origin, "Unauthorized", 401);
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get("user_id") as string;

    const guilds = db.get_all_guilds_of_user(userId);

    return corsResponse(origin, guilds, 200);
}

// get - has auth
async function handle_guild_delete(req: BunRequest) {
    const origin = req.headers.get("Origin") as string;

    const isAuthenticated = await verify_auth(req);
    if (!isAuthenticated) {
        return corsResponse(origin, "User is not authenticated", 403);
    }

    //@ts-ignore
    const userId = req.cookies.get("user_id") as string;
    const guild_id = new URL(req.url).searchParams.get("guild_id") as string;

    if (!db.delete_guild(guild_id, userId)) {
        return corsResponse(origin, "Invalid operation", 403);
    }

    return corsResponse(origin, "Deleted guild", 200);
}

// get - has auth
async function handle_guild_leave(req: BunRequest) {
    const origin = req.headers.get("Origin") as string;

    const isAuthenticated = await verify_auth(req);
    if (!isAuthenticated) {
        return corsResponse(origin, "User is not authenticated", 403);
    }

    //@ts-ignore
    const userId = req.cookies.get("user_id") as string;
    const guild_id = new URL(req.url).searchParams.get("guild_id") as string;

    if (db.leave_guild(guild_id, userId).changes === 0) {
        return corsResponse(origin, "Invalid operation", 403);
    }

    return corsResponse(origin, "Left guild", 200);
}

function handle_ws_event(message: any, ws: any) {
    const msgObj = JSON.parse(
        message.replace("event:", ""),
    ) as GuildEvent;

    if (msgObj.eventType === "delete") {
        const deletedMessage = db.delete_message(
            msgObj.id,
            ws.data.user_id,
        );

        if (!deletedMessage) return;
    }

    if (msgObj.eventType === "edit") {
        const editedMessage = db.edit_message(
            msgObj.id,
            ws.data.user_id,
            msgObj.content as string,
        );

        if (!editedMessage) return;
    }

    connectedWsClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

//*===================================== SERVER =========================================
const server = Bun.serve({
    port: 5000,
    idleTimeout: 0,
    ...(serverEnv === "development"
        ? {
            tls: {
                keyFile: "./localhost.key",
                certFile: "./localhost.crt",
            },
        }
        : {}),
    routes: {
        "/hello": () => {
            return new Response("sup bitch");
        },
        "/grab_old_msgs": handle_get_messages, // get
        "/ws": handle_ws, // get
        "/get_user": handle_get_user, // get
        "/register": handle_register, // post
        "/login": handle_login, // post
        "/validate_auth": handle_validate_auth, // local connection // get
        "/validate_user_in_guild": handle_check_user_is_in_guild, // local connection // get
        "/create_guild": handle_create_guild, // post
        "/join_guild": handle_join_guild, // get
        "/get_guild": handle_get_guild, // local connection // get
        "/get_user_guilds": handle_get_user_guilds, // local connection // get
        "/delete_guild": handle_guild_delete, // get
        "/leave_guild": handle_guild_leave, // get
    },
    websocket: {
        async message(ws: any, message: any) {
            if (message.startsWith("event:")) {
                handle_ws_event(message, ws);
            }

            if (message.startsWith("message:")) {
                const msgObj = JSON.parse(message.replace("message:", ""));

                const newMessage = handle_msg_upload(msgObj);

                connectedWsClients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send("message:" + JSON.stringify(newMessage));
                    }
                });
            }
        },

        async open(ws: any) {
            ws.send("Connected");
            connectedWsClients.add(ws);
        },
        async close(ws: any) {
            connectedWsClients.delete(ws);
        },
        idleTimeout: 0,
    },
});

console.log(`Listening on http://${server.hostname}:${server.port}`);
