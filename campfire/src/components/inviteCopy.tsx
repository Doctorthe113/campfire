"use client";
import { toast } from "sonner";

export default function InviteCopy({ guildId }: { guildId: string }) {
    let domain: string;
    const env = process.env.NODE_ENV;
    if (env === "production") {
        domain = "https://campfire.doctorthe113.com";
    } else {
        domain = "http://localhost:3000";
    }

    const copy_to_clipboard = async () => {
        await navigator.clipboard.writeText(
            `${domain}/api/invite?guild_id=${guildId}`,
        );

        toast.success("Copied invite link to clipboard.", {
            description: `${domain}/api/invite?guild_id=${guildId}`,
            action: {
                label: "Okay",
                onClick: () => {},
            },
        });
    };
    return (
        <div
            onClick={copy_to_clipboard}
            className="h-full w-full cursor-copy"
        >
            Invite
        </div>
    );
}
