import { redirect } from "next/navigation";
import ChatSend from "./chatSend";
import MsgPreview from "./msgPreview";

//* type definitions
type Message = {
    id: string;
    user: string;
    guild: string;
    content: string;
    timestamp: string;
};

type User = {
    id: string;
    username: string;
    guilds_in: string;
    created_at: string;
};

export default async function Page(
    { params }: { params: Promise<{ guildId: string }> },
) {
    const guildId = await params;

    // get user info
    const userInfo: User = await (await fetch("http://localhost:5000/user/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId: "0195fcaa-6c12-7d88-9553-4a89bfa9fa7c", // todo: change the placeholder
        }),
    })).json();

    // check if user isnt in guild and redirects to chatroom home page
    if (userInfo.guilds_in.includes(guildId.guildId) === false) {
        redirect("/chatroom");
    }

    // grabs prev messages to pass down as props to MsgPreview
    const prevMessages: Array<Message> = await (await fetch(
        `http://localhost:5000/receive/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                guild: guildId.guildId,
                page: 1,
                pageSize: 50,
            }),
        },
    )).json();

    return (
        <>
            <div className="flex">
                <div className="h-screen w-32 bg-secondary">
                </div>
                <div className="flex flex-col h-screen grow">
                    {prevMessages.length > 0
                        ? (
                            <MsgPreview
                                guildId={guildId.guildId}
                                prevMessages={prevMessages}
                            >
                            </MsgPreview>
                        )
                        : (
                            <div
                                className="grow overflow-y-scroll"
                                id="messages-list"
                            >
                                Loading
                            </div>
                        )}
                    <ChatSend guildId={guildId.guildId}></ChatSend>
                </div>
                <div className="h-screen w-32 bg-secondary"></div>
            </div>
        </>
    );
}
