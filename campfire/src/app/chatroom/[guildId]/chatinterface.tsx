"use client";
import { useEffect, useState } from "react";
import { AutosizeTextarea } from "@/components/ui/autoresizetextarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CornerDownLeft } from "lucide-react";

type Message = {
    id: string;
    author_id: string;
    author_name: string;
    guild: string;
    content: string;
    avatar: string;
    created_at: string;
};

export default function ChatInterface(
    { guildId, username, userId, guildName, avatarUrl }: {
        guildId: string;
        username: string;
        userId: string;
        guildName: string;
        avatarUrl: string;
    },
) {
    const [messages, setMessages] = useState([] as Array<Message>);
    const [ws, setWs] = useState(null as WebSocket | null);
    const [msgContent, setMsgContent] = useState("");

    // sets api url based on env
    let apiDomain: string;
    const env = process.env.NODE_ENV;
    if (env === "production") {
        apiDomain = "api.campfire.doctorthe113.com";
    } else {
        apiDomain = "localhost:5000";
    }

    // listens to the websocket
    if (ws !== null) {
        ws.onmessage = (e) => {
            try {
                const parsedMsg = JSON.parse(e.data);
                if (parsedMsg.guild === guildId) {
                    setMessages((messages) => [...messages, parsedMsg]);
                }
            } catch {}
        };
    }

    // get previous messeges from the guild
    const grab_old_msgs = async (guildId: string) => {
        const messages = await fetch(
            `https://${apiDomain}/grab_old_msgs?guild_id=${guildId}`,
            { credentials: "include", method: "GET" },
        );

        return messages.json();
    };

    // send message via websocket
    const send_message = async (e: any) => {
        e.preventDefault();
        const textArea = document.getElementById(
            "chat-text-area",
        ) as HTMLTextAreaElement;

        try {
            ws?.send(
                JSON.stringify({
                    guild: guildId,
                    author_id: userId,
                    author_name: username,
                    content: msgContent,
                    avatar: avatarUrl,
                }),
            );
        } catch {
            toast("Failed to send message.", {
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
        }
        textArea.value = "";
    };

    // format time to local
    const format_time = (time: string) => {
        const date = new Date(time.replace(" ", "T") + "Z");
        return date.toLocaleString();
    };

    // for auto scroll
    useEffect(() => {
        const lastMsgId = messages[messages.length - 1]?.id;
        document.getElementById(lastMsgId)?.scrollIntoView({
            behavior: "instant",
        });
    }, [messages]);

    // on mount
    useEffect(() => {
        // grabs all the old messages
        async function _() {
            const oldMessages: Array<Message> = await grab_old_msgs(guildId);
            setMessages(oldMessages);
        }
        _();

        // changes focus to textarea
        const textArea = document.getElementById(
            "chat-text-area",
        ) as HTMLInputElement;
        textArea.focus();

        // sets up websocket
        const ws = new WebSocket(
            `wss://${apiDomain}/ws?guild_id=${guildId}&user_id=${userId}`,
        );
        ws.onopen = () => {
            // ? not sure if i should sent a toast
            // toast("Connected to websocket.", {
            //     action: {
            //         label: "Okay",
            //         onClick: () => {},
            //     },
            // });
            console.log("Connected to websocket.");
        };

        if (!ws) {
            toast("Failed to connect to websocket.", {
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
        }

        setWs(ws);
    }, []);

    return (
        <div className="flex flex-col grow min-h-0">
            <div className="grow w-full flex flex-col overflow-y-auto min-h-0">
                {messages.map((message: Message) => {
                    return (
                        <div
                            className="flex w-full my-1"
                            id={message.id}
                            key={`message-div${message.id}`}
                        >
                            <img
                                src={message.avatar}
                                alt=""
                                className="w-10 h-10 mr-2 rounded-sm"
                                key={`message-avatar${message.id}`}
                            >
                            </img>
                            <div
                                className="flex flex-col grow bg-muted px-2 rounded-sm py-0.5"
                                key={`message-body-div${message.id}`}
                            >
                                <div className="text-sm flex">
                                    <span className="text-accent-foreground">
                                        {message.author_name}
                                    </span>
                                    <span className="min-w-4 text-center">
                                        -
                                    </span>
                                    <span className="text-muted-foreground">
                                        {format_time(message.created_at)}
                                    </span>
                                </div>
                                <pre className="text-sm font-serif leading-tight">
                                    {message.content}
                                </pre>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="w-full max-h-28 h-fit flex">
                <AutosizeTextarea
                    placeholder={`Send a message to ${guildName.toUpperCase()}`}
                    maxHeight={102}
                    minHeight={48}
                    id="chat-text-area"
                    className="resize-none max-h-25 mr-2 h-12"
                    onChange={(e) => {
                        setMsgContent(e.target.value);
                    }}
                    onKeyDown={(e) => {
                        if ((e.shiftKey || e.ctrlKey) && e.key === "Enter") {
                        } else if (e.key === "Enter") {
                            send_message(e);
                        }
                    }}
                >
                </AutosizeTextarea>
                <Button
                    onClick={send_message}
                    className="h-12 text-secondary font-bold"
                    disabled={!msgContent.trim()}
                >
                    <CornerDownLeft />
                    Send
                </Button>
            </div>
        </div>
    );
}
