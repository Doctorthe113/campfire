import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { GuildSidebar } from "@/components/guild-sidebar";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { validate_auth } from "@/utils/validate-auth";
import ChatInterface from "./chatinterface";
import { Separator } from "@/components/ui/separator";
import DarkModeToggle from "@/components/ui/darkModeToggle";

type Guild = {
    id: string;
    name: string;
    owner: string;
    created_at: string;
};

const validate_user_access = async (guildId: string, userId: string) => {
    const isValid = await fetch(
        `http://localhost:5000/validate_user_in_guild?user_id=${userId}&guild_id=${guildId}`,
    );

    if (isValid.status !== 200) {
        return redirect("/chatroom");
    }
};

const get_guild = async (guildId: string) => {
    try {
        return await (await fetch(
            "http://localhost:5000/get_guild?guild_id=" + guildId,
        )).json();
    } catch {
        return redirect("/chatroom");
    }
};

const get_user = async (userEmail: string) => {
    return await (await fetch(
        "http://localhost:5000/get_user?user_email=" + userEmail,
    )).json();
};

export default async function Chatroom(
    { params }: { params: Promise<{ guildId: string }> },
) {
    const guildId: string = (await params).guildId;
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value as string;
    const userId = cookieStore.get("user_id")?.value as string;
    const email = cookieStore.get("user_email")?.value as string;
    const guildInfo = await get_guild(guildId) as Guild;
    const userInfo = await get_user(email);

    await validate_auth(cookieStore);
    await validate_user_access(guildId, userId);

    return (
        <SidebarProvider className="w-screen h-screen">
            <GuildSidebar
                currentGuildName={guildInfo.name}
                userInfo={userInfo}
            />
            <SidebarInset>
                <main className="rounded-lg m-2 flex flex-col grow min-h-0">
                    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-8 flex h-8 shrink-0 items-center gap-2 border-b border-b-secondary transition-[width,height] ease-linear">
                        <SidebarTrigger className="ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mx-0 data-[orientation=vertical]:h-4"
                        />
                        <h1 className="text-base font-bold mx-1">
                            {guildInfo.name.toUpperCase()}
                        </h1>
                        <DarkModeToggle />
                    </header>
                    <ChatInterface
                        guildId={guildId}
                        username={userInfo.username}
                        userId={userId}
                        guildName={guildInfo.name}
                        avatarUrl={userInfo.avatar}
                    />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
