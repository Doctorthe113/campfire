"use client";
import { useEffect, useState } from "react";

type Message = {
    id: string;
    user: string;
    guild: string;
    content: string;
    timestamp: string;
};

export default function MsgPreview(
    { guildId, prevMessages }: {
        guildId: string;
        prevMessages: Array<Message>;
    },
) {
    const [messages, setMessages] = useState<Array<Message>>([...prevMessages]);
    const [eventSource, setEventSource] = useState<EventSource | null>(null);

    if (eventSource) {
        eventSource.onmessage = (event) => {
            setMessages([...messages, JSON.parse(event.data)]);
        };
    }

    useEffect(() => {
        const lastMsgId = messages[messages.length - 1]?.id;
        document.getElementById(lastMsgId)?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    useEffect(() => {
        setEventSource(
            new EventSource(`http://localhost:5000/events/${guildId}`),
        );
    }, []);

    return (
        <div className="grow overflow-y-scroll" id="messages-list">
            {messages.map((msg) => (
                <div key={"key: " + msg.id} id={msg.id}>
                    <span className="text-sm px-2 text-muted-foreground">
                        {msg.user}
                    </span>
                    <span className="text-sm px-1 text-muted-foreground">
                        {msg.timestamp}
                    </span>
                    <p className="text-lg px-1">{msg.content}</p>
                </div>
            ))}
        </div>
    );
}
