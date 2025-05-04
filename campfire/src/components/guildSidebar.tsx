import { GuildDialog } from "@/components/guild-dialog";
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
import Image from "next/image";
import Link from "next/link";
import { GuildPreference, GuildPreferenceContextMenu } from "./guildPreference";
import InviteCopy from "./inviteCopy";
import { ContextMenu, ContextMenuTrigger } from "./ui/context-menu";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type User = {
    id: string;
    username: string;
    email: string;
    password: string;
    avatar: string | Uint8Array;
    status: string;
    created_at: string;
};

// get a list of guilds that the user is in
const get_user_guilds = async (userId: string) => {
    return await (await fetch(
        `${
            process.env.NODE_ENV === "development"
                ? "https"
                : "http"
        }://127.0.0.1:5000/get_user_guilds?user_id=${userId}`,
    )).json();
};

export async function GuildSidebar(
    { currentGuildName, guildId, userInfo }: {
        currentGuildName: string;
        guildId: string;
        userInfo: User;
    },
) {
    const guildList = await get_user_guilds(userInfo.id);

    return (
        <Sidebar variant="inset" collapsible="offcanvas">
            <SidebarHeader className="p-0 bg-background md:rounded-lg md:border-1 border-border cursor-pointer">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className="flex h-16 m-0 p-0 md:rounded-lg rounded-none border-none focus-visible:border-none active:border-none"
                        asChild
                    >
                        <SidebarMenuButton className="" asChild>
                            <div className="flex h-full m-0 items-center w-full px-2 py-1 border-none">
                                <Image
                                    src={userInfo.avatar as string}
                                    id="avatar-img"
                                    width={128}
                                    height={128}
                                    alt=""
                                    className="inline rounded-sm h-12 w-12"
                                >
                                </Image>
                                <div className="flex flex-col h-14 justify-between pl-2 py-1 grow">
                                    <span className="font-bold text-primary text-lg w-full m-0 h-5 leading-tight text-right">
                                        {userInfo.username}
                                    </span>
                                    <span className="text-[11px] w-full text-right m-0 grow leading-tight">
                                        {userInfo.status}
                                    </span>
                                </div>
                            </div>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-popper-anchor-width] bg-accent text-foreground border-1 border-border"
                        align="end"
                    >
                        <DropdownMenuLabel className="text-xs leading-tight">
                            My Account
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem className="focus:bg-background">
                                <Link href="/profile" className="w-full">
                                    User settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-background">
                                <Link href="" className="w-full">
                                    Change status ⚠️
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-background">
                                <Link href="" className="w-full">
                                    Delete account ⚠️
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-background">
                                <Link
                                    href="/api/logout"
                                    className="w-full"
                                >
                                    Logout
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs leading-tight">
                            Guild
                        </DropdownMenuLabel>
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                className="focus:bg-background"
                                disabled={!guildId}
                            >
                                <Link href="" className="w-full">
                                    Update guild profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="focus:bg-background"
                                disabled={!guildId}
                            >
                                <InviteCopy guildId={guildId} />
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarHeader>
            <SidebarContent className="m-0 pt-0" id="guild-selector">
                <SidebarGroup className="p-0">
                    <SidebarGroupLabel className="px-1">
                        Guilds
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {guildList.map((guild: any) => (
                            <SidebarMenuItem
                                key={guild.id}
                                className={`m-0 p-0 px-1 active:scale-90 active:bg-background active:rounded-sm duration-10 hover:rounded-sm md:rounded-sm rounded-none hover:bg-background hover:border-foreground h-fit flex items-center btn ${
                                    currentGuildName === guild.name
                                        ? "bg-background"
                                        : ""
                                }`}
                                id={`sidebar-menu-item-${guild.id}`}
                            >
                                <ContextMenu>
                                    <ContextMenuTrigger
                                        className="bg-transparent hover:bg-transparent active:bg-transparent focus-visible:bg-transparent"
                                        asChild
                                    >
                                        <SidebarMenuButton
                                            asChild
                                            className="p-0 m-0 hover:bg-transparent active:bg-transparent"
                                        >
                                            <div className="flex justify-start items-center h-max p-0">
                                                <Link
                                                    className="grow h-max text-sm flex items-center"
                                                    href={`/chatroom/${guild.id}`}
                                                >
                                                    <Image
                                                        src={guild.avatar}
                                                        alt=""
                                                        width={16}
                                                        height={16}
                                                        className="inline rounded-[4px] h-6 w-6 my-1 mr-2"
                                                    >
                                                    </Image>
                                                    <span
                                                        className={`${
                                                            guild.name ==
                                                                    currentGuildName
                                                                ? "text-primary"
                                                                : ""
                                                        }`}
                                                    >
                                                        {guild.name}
                                                    </span>
                                                </Link>
                                            </div>
                                        </SidebarMenuButton>
                                    </ContextMenuTrigger>
                                    <GuildPreferenceContextMenu
                                        isAllowedDelete={guild.owner ===
                                            userInfo.id}
                                        guildId={guild.id}
                                    />
                                </ContextMenu>
                                <GuildPreference
                                    isAllowedDelete={guild.owner ===
                                        userInfo.id}
                                    guildId={guild.id}
                                />
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-0 md:rounded-lg md:border-1 border-border bg-background">
                <div className="h-13 p-2 flex items-center justify-evenly">
                    <GuildDialog />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
