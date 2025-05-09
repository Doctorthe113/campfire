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
    // sets api url based on env
    let apiDomain: string;
    const env = process.env.NODE_ENV;
    if (env === "production") {
        apiDomain = "api.campfire.doctorthe113.com";
    } else {
        apiDomain = "localhost:5000";
    }

    // for logging in
    const handle_login = async () => {
        const email =
            (document.querySelector("#email-input") as HTMLInputElement).value;
        const password =
            (document.querySelector("#password-input") as HTMLInputElement)
                .value;

        if (email === "" || password === "") {
            toast.error("Please fill in all fields.", {
                description: "Email or password is empty.",
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

        const res = await fetch(`https://${apiDomain}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email, password: password }),
            credentials: "include",
        });

        if (res.status === 401) {
            toast.error("Incorrect credentials.", {
                description: "Email or password is incorrect.",
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
            return;
        } else if (res.status === 404) {
            toast.error("User not found.", {
                description: "User does not exist. Register instead.",
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
            return;
        } else if (res.status === 200) {
            toast.success("Login successful.", {
                description: "You have successfully logged in.",
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
            redirect("/chatroom");
        }
    };

    const handle_enter_press = (e: any) => {
        if (e.key === "Enter") {
            handle_login();
        }
    };

    return (
        <div
            className="flex h-screen w-screen items-center justify-center"
            onKeyDown={handle_enter_press}
        >
            <Card className="w-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">LOGIN</CardTitle>
                    <CardDescription>
                        Enter your email and password to login.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-1">
                        <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Email
                        </label>
                        <Input
                            type="email"
                            id="email-input"
                        />
                    </div>
                    <div className="grid gap-1">
                        <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Password
                        </label>
                        <Input
                            type="password"
                            id="password-input"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col">
                    <Button
                        className="text-secondary mb-2 w-full font-bold"
                        onClick={handle_login}
                    >
                        Login
                    </Button>
                    <Button className="text-secondary w-full font-bold" asChild>
                        <Link href="/register">Create Account?</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
