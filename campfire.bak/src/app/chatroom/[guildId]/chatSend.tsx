"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

export default function ChatSend({ guildId }: { guildId: string }) {
    const [message, setMessage] = useState("");

    const handle_send_message = async (e: any) => {
        e.preventDefault();
        const msg =
            (document.getElementById("msg-textarea") as HTMLTextAreaElement)
                ?.value;
        await fetch("http://localhost:5000/send/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user: "user",
                guild: guildId,
                content: msg,
            }),
        });
        (document.getElementById("msg-textarea") as HTMLTextAreaElement)
            .value = "";
    };

    const handle_key_press = (e: any) => {
        if (e.key === "Enter") {
            handle_send_message(e);
        }
    };

    useEffect(() => {
        document.getElementById("msg-textarea")?.focus();
    }, []);

    return (
        <form
            className="flex items-center justify-between min-h-16"
            onSubmit={handle_send_message}
            action=""
        >
            <Textarea
                placeholder={`Send a message to ${guildId}`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handle_key_press}
                className="resize-none"
                id="msg-textarea"
            />
            <Button
                variant="default"
                className="h-full w-12"
            >
            </Button>
        </form>
    );
}
