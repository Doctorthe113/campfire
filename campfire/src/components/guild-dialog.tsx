"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";
import { toast } from "sonner";

export function GuildDialog() {
    // sets api url based on env
    let apiDomain: string;
    const env = process.env.NODE_ENV;
    if (env === "production") {
        apiDomain = "api.campfire.doctorthe113.com";
    } else {
        apiDomain = "localhost:5000";
    }

    const handle_join_guild = async (e: any) => {
        e.preventDefault();
        const guildId =
            (document.getElementById("join-guild-id") as HTMLInputElement)
                .value;

        if (guildId === "") {
            toast("Please fill in all fields.", {
                description: "Guild ID is empty.",
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
            return;
        }

        const res = await fetch(
            `https://${apiDomain}/join_guild?guild_id=${guildId}`,
            { credentials: "include", method: "GET" },
        );

        if (res.status === 200) {
            redirect(`/chatroom/${guildId}`);
        } else {
            console.log(await res.text());

            toast("Failed to join guild.", {
                description: "Guild may not exist or you already joined it.",
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
        }
    };

    const handle_create_guild = async (e: any) => {
        e.preventDefault();
        const guildName =
            (document.getElementById("create-guild-id") as HTMLInputElement)
                .value;

        if (guildName === "") {
            toast("Please fill in all fields.", {
                description: "Guild name is empty.",
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
            return;
        }

        const res = await fetch(
            `https://${apiDomain}/create_guild`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    guild_name: guildName.toLowerCase().replace(" ", "-"),
                }),
            },
        );

        const guildId = await res.text();

        if (res.status === 200) {
            redirect(`/chatroom/${guildId}`);
        } else if (res.status === 403) {
            toast("Failed to join guild.", {
                description: "Guild may not exist or you already joined it.",
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
        }
    };

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        variant="default"
                        className="flex-1 m-0 mr-1 text-secondary font-bold rounded-[6px]"
                    >
                        Join
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Join a new guild</DialogTitle>
                        <DialogDescription>
                            Join a guild to chat with your friends
                        </DialogDescription>
                    </DialogHeader>
                    <div
                        className="grid gap-4 py-4"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handle_join_guild(e);
                        }}
                    >
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Guild ID
                            </Label>
                            <Input
                                id="join-guild-id"
                                type="text"
                                defaultValue=""
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            onClick={handle_join_guild}
                            className="text-secondary font-bold"
                        >
                            Join
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        variant="default"
                        className="flex-1 m-0 ml-1 text-secondary font-bold rounded-[6px]"
                    >
                        Create
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create a new guild</DialogTitle>
                        <DialogDescription>
                            Create a guild to chat with your friends
                        </DialogDescription>
                    </DialogHeader>
                    <div
                        className="grid gap-4 py-4"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handle_create_guild(e);
                        }}
                    >
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Guild Name
                            </Label>
                            <Input
                                id="create-guild-id"
                                type="text"
                                defaultValue=""
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            onClick={handle_create_guild}
                            className="text-secondary font-bold"
                        >
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
