import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { GuildDialog } from "@/components/guild-dialog";
import Link from "next/link";
import Image from "next/image";

type User = {
    id: string;
    username: string;
    email: string;
    password: string;
    avatar: string | Uint8Array;
    created_at: string;
};

// get a list of guilds that the user is in
const get_user_guilds = async (userId: string) => {
    return await (await fetch(
        "http://localhost:5000/get_user_guilds?user_id=" + userId,
    )).json();
};

export async function GuildSidebar(
    { currentGuildName, userInfo }: {
        currentGuildName: string;
        userInfo: User;
    },
) {
    const guildList = await get_user_guilds(userInfo.id);

    return (
        <Sidebar variant="inset" collapsible="offcanvas">
            <SidebarHeader className="p-0 bg-background rounded-lg border-2 border-text">
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex h-16 m-0 p-0" asChild>
                        <SidebarMenuButton>
                            <div className="flex h-full m-0 items-center w-full px-2">
                                <Image
                                    src={userInfo.avatar as string}
                                    id="avatar-img"
                                    width={48}
                                    height={48}
                                    alt=""
                                    className="inline rounded-sm h-12 w-12"
                                >
                                </Image>
                                <div className="flex flex-col h-14 justify-between pl-2 py-1 grow">
                                    <span className="font-bold text-primary text-lg w-full m-0 h-5 leading-tight text-right">
                                        {userInfo.username.toUpperCase()}
                                    </span>
                                    <span className="text-[11px] w-full text-right m-0 grow leading-tight">
                                        {userInfo.email}
                                    </span>
                                </div>
                            </div>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-popper-anchor-width] bg-accent text-primary border-1 border-foreground"
                        align="end"
                    >
                        <DropdownMenuLabel className="text-sm font-bold">
                            My Account
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem className="focus:bg-background">
                                <Link href="" className="w-full">
                                    Update profile
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem className="focus:bg-background">
                                <Link
                                    href="http://localhost:5000/logout"
                                    className="w-full"
                                >
                                    Logout
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarHeader>
            <SidebarContent className="m-0 pt-0">
                <SidebarGroup className="p-0">
                    <SidebarGroupLabel>Guilds</SidebarGroupLabel>
                    <SidebarMenu>
                        {guildList.map((guild: any) => (
                            <SidebarMenuItem key={guild.id}>
                                <SidebarMenuButton
                                    asChild
                                    className="m-0 p-0 hover:rounded-sm px-2 py-1 h-fit"
                                >
                                    <div className="flex justify-start items-center h-6">
                                        <Image
                                            src={guild.avatar}
                                            alt=""
                                            width={16}
                                            height={16}
                                            className="inline rounded-[4px] h-full w-6"
                                        >
                                        </Image>
                                        <Link
                                            className="grow h-full text-sm"
                                            href={`/chatroom/${guild.id}`}
                                        >
                                            <span
                                                className={guild.name ==
                                                        currentGuildName
                                                    ? "text-primary"
                                                    : ""}
                                            >
                                                {guild.name}
                                            </span>
                                        </Link>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-0 rounded-lg border-2 border-text bg-background">
                <div className="h-13 p-2 flex items-center justify-evenly">
                    <GuildDialog />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
