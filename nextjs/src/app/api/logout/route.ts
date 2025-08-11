import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(req: Request) {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    cookieStore.delete("user_id");
    cookieStore.delete("username");
    cookieStore.delete("user_email");

    return redirect("/login");
}
