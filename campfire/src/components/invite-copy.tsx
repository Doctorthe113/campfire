"use client";
import { toast } from "sonner";

export default function InviteCopy({ guildId }: { guildId: string }) {
    const copy_to_clipboard = async () => {
        await navigator.clipboard.writeText(
            `https://campfire.doctorthe113.com/invite?guild_id=${guildId}`,
        );

        toast("Copied invite link to clipboard.", {
            description:
                `https://campfire.doctorthe113.com/invite?guild_id=${guildId}`,
            action: {
                label: "Okay",
                onClick: () => {},
            },
        });
    };
    return (
        <div onClick={copy_to_clipboard} className="h-full w-full">Invite</div>
    );
}
