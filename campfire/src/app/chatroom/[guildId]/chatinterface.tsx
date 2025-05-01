"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CornerDownLeft, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EditDialog } from "@/components/edit-dialog";
import { ConfirmationDialog } from "@/components/confirmation-dialog";

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
    const [isLaoded, setIsloaded] = useState(false);

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
            if (e.data.startsWith("message:")) {
                const parsedMsg = JSON.parse(
                    e.data.replace("message:", ""),
                );
                if (parsedMsg.guild === guildId) {
                    setMessages((messages) => [...messages, parsedMsg]);
                }
            } else if (e.data.startsWith("event:")) {
                handle_ws_events(e);
            }
        };
    }

    // checks if the message is too long
    if (msgContent.length > 2000) {
        toast("Message too long.", {
            action: {
                label: "Okay",
                onClick: () => {},
            },
        });
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

        if (msgContent.length > 2000) {
            toast("Message too long.", {
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
        }

        if (msgContent === "") return;

        try {
            ws?.send(
                "message:" +
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
        textArea.focus();
        setMsgContent("");
    };

    // delete message
    const delete_message = async (msgId: string) => {
        ws?.send(
            "event:" +
                JSON.stringify({
                    eventType: "delete",
                    guild: guildId,
                    id: msgId,
                }),
        );
    };

    // edit message
    const edit_message = async (
        e: any,
        msgId: string,
        newMsgContent: string,
    ) => {
        e.preventDefault();

        if (
            messages.filter((msg) => msg.id === msgId)[0].author_id !== userId
        ) {
            return;
        }

        if (newMsgContent === "") return;

        ws?.send(
            "event:" +
                JSON.stringify({
                    eventType: "edit",
                    guild: guildId,
                    id: msgId,
                    content: newMsgContent,
                }),
        );
    };

    // format time to local
    const format_time = (time: string) => {
        const date = new Date(time.replace(" ", "T") + "Z");
        return date.toLocaleString();
    };

    // handle websocket events
    const handle_ws_events = (e: any) => {
        const parsedMsg = JSON.parse(e.data.replace("event:", ""));

        // early return if the event doesnt belong to the current guild
        if (parsedMsg.guild !== guildId) {
            return;
        }

        if (parsedMsg.eventType === "delete") {
            console.log(parsedMsg);
            setMessages((messages) =>
                messages.filter((msg) => msg.id !== parsedMsg.id)
            );
        }

        if (parsedMsg.eventType === "edit") {
            setMessages((messages) =>
                messages.map((msg) => {
                    if (msg.id === parsedMsg.id) {
                        msg.content = parsedMsg.content;
                    }
                    return msg;
                })
            );
        }
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
        // changes focus to textarea
        const textArea = document.getElementById(
            "chat-text-area",
        ) as HTMLInputElement;
        textArea.focus();

        // grabs all the old messages
        async function _() {
            const oldMessages: Array<Message> = await grab_old_msgs(guildId);
            setMessages(oldMessages);
        }
        _();

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
        setIsloaded(true);
    }, []);

    return (
        <div className="flex flex-col grow min-h-0">
            {isLaoded
                ? (
                    <div className="grow w-full flex flex-col overflow-y-auto min-h-0">
                        {messages.map((message: Message) => {
                            return (
                                <div
                                    className={`flex w-full lg:max-w-2/3 my-1 gap-2 ${
                                        message.author_id === userId
                                            ? "ml-auto flex-row-reverse"
                                            : ""
                                    }`}
                                    id={message.id}
                                    key={`message-div${message.id}`}
                                >
                                    <img
                                        src={message.avatar}
                                        alt=""
                                        className="w-10 h-10 rounded-sm"
                                        key={`message-avatar${message.id}`}
                                    >
                                    </img>
                                    <div
                                        className={`flex flex-col w-max max-w-9/12 ${
                                            message.author_id === userId
                                                ? "bg-accent"
                                                : "bg-muted"
                                        } px-2 rounded-sm py-0.5`}
                                        key={`message-body-div${message.id}`}
                                    >
                                        <div className="text-sm flex items-center">
                                            <span className="text-accent-foreground">
                                                {message.author_name}
                                            </span>
                                            <span className="min-w-4 text-center">
                                                -
                                            </span>
                                            <span className="text-muted-foreground text-xs min-w-34">
                                                {format_time(
                                                    message.created_at,
                                                )}
                                            </span>
                                        </div>
                                        <pre className="text-sm font-sans2 leading-tight wrap-anywhere text-wrap">
                                    {message.content}
                                        </pre>
                                    </div>
                                    {message.author_id === userId
                                        ? (
                                            <>
                                                <ConfirmationDialog
                                                    confirmationMsg="Do you want to delete this message?"
                                                    confirmationFunction={() =>
                                                        delete_message(
                                                            message.id,
                                                        )}
                                                >
                                                    <Button
                                                        variant={"outline"}
                                                        id={`delete-btn-${message.id}`}
                                                        className={"w-6 h-6 rounded-sm border-0 text-destructive"}
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                </ConfirmationDialog>
                                                <EditDialog
                                                    msgId={message.id}
                                                    updateMessage={edit_message}
                                                />
                                            </>
                                        )
                                        : null}
                                </div>
                            );
                        })}
                    </div>
                )
                : (
                    <div className="grow w-full flex flex-col overflow-y-auto min-h-0">
                    </div>
                )}
            <form
                className="w-full max-h-28 h-fit flex mt-2 sticky bottom-0 bg-background"
                onSubmit={send_message}
            >
                <Textarea
                    placeholder={`Send a message to ${guildName.toUpperCase()}`}
                    id="chat-text-area"
                    className="resize-none max-h-25 mr-2 h-12"
                    onChange={(e) => {
                        setMsgContent(e.target.value);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault(); // Prevent default Enter (new line)
                            send_message(e); // Manually trigger send_message
                        }
                    }}
                >
                </Textarea>
                <Button
                    type="submit"
                    className="min-h-12 max-h-[66px] h-full text-secondary font-bold"
                    disabled={!msgContent.trim()}
                >
                    <CornerDownLeft />
                    Send
                </Button>
            </form>
        </div>
    );
}
