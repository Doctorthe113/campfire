import { useEffect, useState } from "react";
import "./App.css";

function App() {
    const [eventSource, setEventSource] = useState(null);
    const [messages, setMessages] = useState([]);
    const [guild, setGuild] = useState("");

    if (eventSource) {
        eventSource.onmessage = (event) => {
            setMessages([...messages, event.data]);
        };
    }

    const handle_send_message = async (e) => {
        e.preventDefault();
        const msg = e.target.elements.msg.value;
        await fetch("http://localhost:3000/send/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user: "user", guild: guild, content: msg }),
        });
        e.target.elements.msg.value = "";
    };

    useEffect(() => {
        setEventSource(new EventSource("http://localhost:3000/events"));
    }, []);

    return (
        <>
            {messages.map((msg, key) => {
                return <p key={key}>{msg}</p>;
            })}
            <form action="" onSubmit={handle_send_message}>
                <input type="text" name="msg" id="msg" />
                <button>Send</button>
            </form>
        </>
    );
}

export default App;
