"use client";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ContextMenuContent, ContextMenuItem } from "./ui/context-menu";
import { MoreHorizontal } from "lucide-react";
import InviteCopy from "./invite-copy";

// todo: refactor needed
let apiDomain: string;
const env = process.env.NODE_ENV;
if (env === "production") {
    apiDomain = "api.campfire.doctorthe113.com";
} else {
    apiDomain = "localhost:5000";
}

const handle_guild_delete = async (guildId: string) => {
    const res = await fetch(
        `https://${apiDomain}/delete_guild?guild_id=${guildId}`,
        {
            credentials: "include",
        },
    );

    if (res.status === 200) {
        window.location.reload();
    }
};

const handle_guild_leave = async (guildId: string) => {
    const res = await fetch(
        `https://${apiDomain}/leave_guild?guild_id=${guildId}`,
        {
            credentials: "include",
        },
    );

    if (res.status === 200) {
        window.location.reload();
    }
};

export function GuildPreference(
    { isAllowedDelete, guildId }: { isAllowedDelete: boolean; guildId: string },
) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="focus-visible:ring-0" asChild>
                <Button className="w-6 h-6 bg-transparent border-none rounded-sm hover:bg-accent focus-visible:ring-0 active:border-none">
                    <MoreHorizontal />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                side="bottom"
                align="end"
                alignOffset={-6}
                className="bg-accent"
            >
                {isAllowedDelete
                    ? (
                        <DropdownMenuItem className="focus:bg-background text-destructive">
                            <span
                                className="w-full cursor-pointer"
                                onClick={() => handle_guild_delete(guildId)}
                            >
                                Delete
                            </span>
                        </DropdownMenuItem>
                    )
                    : null}
                <DropdownMenuItem className="focus:bg-background text-destructive">
                    <span
                        className="w-full cursor-pointer"
                        onClick={() => handle_guild_leave(guildId)}
                    >
                        Leave
                    </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-background">
                    <span className="w-full cursor-pointer">
                        Notifications ⚠️
                    </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-background">
                    <InviteCopy guildId={guildId} />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function GuildPreferenceContextMenu(
    { isAllowedDelete, guildId }: { isAllowedDelete: boolean; guildId: string },
) {
    return (
        <ContextMenuContent className="bg-accent">
            {isAllowedDelete
                ? (
                    <ContextMenuItem className="focus:bg-background text-destructive">
                        <span onClick={() => handle_guild_delete(guildId)}>
                            Delete
                        </span>
                    </ContextMenuItem>
                )
                : null}
            <ContextMenuItem className="focus:bg-background text-destructive">
                <span
                    className="w-full cursor-pointer"
                    onClick={() => handle_guild_leave(guildId)}
                >
                    Leave
                </span>
            </ContextMenuItem>
            <ContextMenuItem className="focus:bg-background">
                <span className="w-full cursor-pointer">Notifications ⚠️</span>
            </ContextMenuItem>
            <ContextMenuItem className="focus:bg-background">
                <InviteCopy guildId={guildId} />
            </ContextMenuItem>
        </ContextMenuContent>
    );
}
