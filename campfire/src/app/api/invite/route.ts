import { validate_auth } from "@/utils/validate-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// todo
export async function GET(req: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    await validate_auth(cookieStore);

    const url = new URL(req.url);
    const guildId = url.searchParams.get("guild_id");

    let apiDomain: string;
    let domain: string;
    const env = process.env.NODE_ENV;
    if (env === "production") {
        apiDomain = "api.campfire.doctorthe113.com";
        domain = "https://campfire.doctorthe113.com";
    } else {
        apiDomain = "127.0.0.1:5000";
        domain = "http://localhost:3000";
    }

    const res = await fetch(
        `https://${apiDomain}/join_guild?guild_id=${guildId}&user_id=${userId}`,
        { method: "GET" },
    );

    if (res.status === 200) {
        return NextResponse.redirect(`${domain}/chatroom/${guildId}`);
    } else {
        return NextResponse.json({ error: "Failed to join guild." });
    }
}
