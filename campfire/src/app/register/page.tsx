"use client";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { redirect } from "next/navigation";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");

    // sets api url based on env
    let apiDomain: string;
    const env = process.env.NODE_ENV;
    if (env === "production") {
        apiDomain = "api.campfire.doctorthe113.com";
    } else {
        apiDomain = "localhost:5000";
    }

    const handle_register = async () => {
        if (email === "" || password === "" || username === "") {
            toast.error("Please fill in all fields.", {
                description: "Email, username or password is empty.",
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
            return;
        }

        if (password.length < 8) {
            toast.error("Password too short.", {
                description: "Password must be at least 8 characters long.",
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Invalid email.", {
                description: "Email is invalid.",
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
            return;
        }

        const res = await fetch(
            `https://${apiDomain}/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    username: username,
                }),
            },
        );

        if (res.status === 200) {
            redirect("/login");
        } else if (res.status === 403) {
            toast.error("Failed to register.", {
                description: "Email or username is already in use.",
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
        }
    };

    const handle_enter_press = (e: any) => {
        if (e.key === "Enter") {
            handle_register();
        }
    };

    return (
        <div
            className="flex h-screen w-screen items-center justify-center"
            onKeyDown={handle_enter_press}
        >
            <Card className="w-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">REGISTER</CardTitle>
                    <CardDescription>
                        Enter your email, username and password to register.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-1">
                        <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Email
                        </label>
                        <Input
                            type="email"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-1">
                        <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Username
                        </label>
                        <Input
                            type="username"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-1">
                        <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Password
                        </label>
                        <Input
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col">
                    <Button
                        className="text-secondary mb-2 w-full font-bold"
                        onClick={handle_register}
                    >
                        Register
                    </Button>
                    <Button className="text-secondary w-full font-bold" asChild>
                        <Link href="/login">Meant to login?</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
