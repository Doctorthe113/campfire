import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(req: Request) {
    console.log("Logging out");

    const cookieStore = await cookies();
    cookieStore.delete("session");
    cookieStore.delete("user_id");
    cookieStore.delete("user_email");
    console.log("Logged out");

    return redirect("/login");
}
