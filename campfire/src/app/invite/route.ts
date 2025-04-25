import { validate_auth } from "@/utils/validate-auth";
import { cookies } from "next/headers";

// todo
export async function GET(req: Request) {
    return new Response(null, { status: 404 });
    const cookieStore = await cookies();
    await validate_auth(cookieStore);
    const url = new URL(req.url);
    const guildId = url.searchParams.get("guild_id");
}
