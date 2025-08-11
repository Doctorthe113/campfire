import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { GuildSidebar } from "@/components/guildSidebar";
import { cookies } from "next/headers";
import { Separator } from "@/components/ui/separator";
import { validate_auth } from "@/utils/validate-auth";
import DarkModeToggle from "@/components/ui/darkModeToggle";
import ProfileInterface from "./profileInterface";

const get_user = async (userEmail: string) => {
    return await (await fetch(
        `${
            process.env.NODE_ENV === "development"
                ? "https"
                : "http"
        }://127.0.0.1:5000/get_user?user_email=${userEmail}`,
    )).json();
};

export default async function Chatroom() {
    const cookieStore = await cookies();
    const email = cookieStore.get("user_email")?.value as string;
    const userInfo = await get_user(email);

    await validate_auth(cookieStore);

    return (
        <SidebarProvider className="w-svw h-svh">
            <GuildSidebar currentGuildName="" guildId="" userInfo={userInfo} />
            <SidebarInset>
                <main className="rounded-lg m-2 flex flex-col grow min-h-0">
                    <header className="shadow-[0px_16px_8px_-4px_rgba(0,0,0,1)] z-10 shadow-background group-has-data-[collapsible=icon]/sidebar-wrapper:h-8 flex h-8 shrink-0 items-center gap-2 border-b border-b-secondary transition-[width,height] ease-linear">
                        <SidebarTrigger className="ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mx-0 data-[orientation=vertical]:h-4"
                        />
                        <h1 className="text-base font-bold mx-1">
                            User settings
                        </h1>
                        <DarkModeToggle />
                    </header>
                    <ProfileInterface userInfo={userInfo} />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
