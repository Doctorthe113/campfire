import { redirect } from "next/navigation";

export async function validate_auth(cookieStore: any) {
    const sessionToken = cookieStore.get("session")?.value;
    const userId = cookieStore.get("user_id")?.value;
    const userEmail = cookieStore.get("user_email")?.value;

    const res = await fetch(
        `${
            process.env.NODE_ENV === "development"
                ? "https"
                : "http"
        }://localhost:5000/validate_auth?token=${sessionToken}&user_id=${userId}&user_email=${userEmail}`,
    );

    if (res.status === 200) {
        return;
    } else {
        return redirect("/login");
    }
}
