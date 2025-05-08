"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";
import Image from "next/image";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export default function ProfileInterface({ userInfo }: { userInfo: any }) {
    const [newAvatar, setNewAvatar] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const ffmpegRef = useRef<FFmpeg | null>(null);
    const [isFfmpegLoaded, setIsFfmpegLoaded] = useState(false);

    // sets api url based on env
    let apiDomain: string;
    const env = process.env.NODE_ENV;
    if (env === "production") {
        apiDomain = "api.campfire.doctorthe113.com";
    } else {
        apiDomain = "localhost:5000";
    }

    // process avatar using ffmpeg
    const process_avatar = async (file: File) => {
        if (!file.type.startsWith("image")) {
            toast.error("Invalid file type", {
                description: "File must be an image.",
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
            return;
        }

        const fileExt = file.type.split("/")[1];

        const ffmpeg = ffmpegRef.current;
        await ffmpeg?.writeFile(`input.${fileExt}`, await fetchFile(file));
        await ffmpeg?.exec([
            "-i",
            `input.${fileExt}`, // Input file in the virtual file system
            "-vf",
            `scale='if(gt(iw,ih),-1,${200})':'if(gt(iw,ih),${200},-1)', crop=${200}:${200}`,
            "-c:v",
            "libwebp",
            "-q:v",
            "75",
            "-y", // Overwrite output file in the virtual file system
            "avatar.webp",
        ]);
        const data = await ffmpeg?.readFile("avatar.webp");

        //@ts-ignore
        const buffer = Buffer.from(data);
        const base64String = buffer.toString(
            "base64",
        );
        return `data:"image/webp";base64,${base64String}`;
    };

    const handle_drag_and_drop = async (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        e.target.style.opacity = "100%";
        let file: File = e.dataTransfer.files[0];

        const newAvatarUrl = await process_avatar(file);

        if (newAvatarUrl === undefined) return;

        setNewAvatar(newAvatarUrl as string);
    };

    const handle_avatar_input = async (e: any) => {
        const file = e.target.files[0];
        const newAvatarUrl = await process_avatar(file);

        if (newAvatarUrl === undefined) return;

        setNewAvatar(newAvatarUrl as string);
    };

    const handle_profile_update = async (e: any) => {
        e.preventDefault();
        const newStatus =
            (document.querySelector("#status-input") as HTMLInputElement)
                .value || "";
        const newAvatarUrl = newAvatar || userInfo.avatar;

        const res = await fetch(
            `https://${apiDomain}/update_profile`,
            {
                credentials: "include",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: newStatus,
                    avatar: newAvatarUrl,
                }),
            },
        );

        if (res.status === 200) {
            window.location.reload();
        } else {
            toast.error("Error updating profile.", {
                description: "Please try again.",
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
        }
    };

    const handle_account_update = async (e: any) => {
        e.preventDefault();
        const newEmail =
            (document.querySelector("#email-input") as HTMLInputElement)
                .value || userInfo.email;
        const newUsername =
            (document.querySelector("#username-input") as HTMLInputElement)
                .value || userInfo.username;

        if (newUsername.length > 16) {
            toast.error("Username too long.", {
                description: "Username must be at most 16 characters long.",
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
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
            `https://${apiDomain}/update_account`,
            {
                credentials: "include",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: newEmail,
                    username: newUsername,
                }),
            },
        );

        if (res.status === 200) {
            redirect("/login");
        } else if (res.status === 403) {
            toast.error("Invalid email or username", {
                description:
                    "There might be an existing entry with the same email or username.",
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
        } else {
            toast.error("Error updating account.", {
                description: "Please try again.",
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
        }
    };

    const handle_password_update = async (e: any) => {
        e.preventDefault();

        const oldPassword =
            (document.querySelector("#oldpassword-input") as HTMLInputElement)
                .value;
        const newPassword =
            (document.querySelector("#newpassword-input") as HTMLInputElement)
                .value;
        const confirmPassword = (document.querySelector(
            "#confirmpassword-input",
        ) as HTMLInputElement).value;

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.", {
                description: "Please try again.",
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
            return;
        }

        if (oldPassword === newPassword) {
            toast.error("New password must be different from old password.", {
                description: "Please try again.",
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
            return;
        }

        const res = await fetch(
            `https://${apiDomain}/update_password`,
            {
                credentials: "include",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    oldPassword: oldPassword,
                    newPassword: newPassword,
                }),
            },
        );

        if (res.status === 200) {
            window.location.reload();
        } else if (res.status === 403) {
            toast.error("Old password is incorrect", {
                description: "Please try again.",
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
        } else {
            toast.error("Error updating password.", {
                description: "Please try again.",
                action: {
                    label: "Okay",
                    onClick: () => {},
                },
            });
        }
    };

    // for loading ffmpeg
    useEffect(() => {
        async function loadFFmpeg() {
            const baseUrl = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";
            const ffmpeg = new FFmpeg();
            ffmpegRef.current = ffmpeg;

            await ffmpeg.load();

            console.log("FFmpeg loaded");
            setIsFfmpegLoaded(true);
        }

        if (typeof window !== "undefined" && !ffmpegRef.current) {
            try {
                loadFFmpeg();
            } catch (e) {
                toast.error("Error loading ffmpeg. Please try again.");
            }
        }
    }, []);

    // todo add the plus icon on image upload hover
    return (
        <div className="flex flex-col grow h-full w-full overflow-scroll min-h-0 px-4 items-center">
            <div className="flex flex-col items-center max-w-md">
                <div className="flex w-full gap-4 my-6 justify-start">
                    <div className="grow flex flex-col gap-2">
                        <h1 className="text-xl font-bold">Update Profile</h1>
                        <h3 className="text-sm">
                            Update status and profile picture
                        </h3>
                        <Input
                            type="text"
                            name="status"
                            defaultValue={userInfo.status || "Hello there"}
                            id="status-input"
                            autoComplete="new-password"
                        />
                        <Button
                            className="w-fit text-secondary font-bold"
                            onClick={handle_profile_update}
                        >
                            Update profile
                        </Button>
                    </div>
                    <Input
                        type="file"
                        name="avatar"
                        id="avatar-input"
                        accept="image/*"
                        onChange={handle_avatar_input}
                        hidden
                        disabled={!isFfmpegLoaded}
                    />
                    <Label
                        htmlFor="avatar-input"
                        className={`aspect-square h-full rounded-full hover:opacity-50 ${
                            isFfmpegLoaded ? "" : "cursor-not-allowed"
                        }`}
                        onDragEnter={(e: any) => {
                            e.preventDefault();
                            e.target.style.opacity = "50%";
                        }}
                        onDragLeave={(e: any) => {
                            e.preventDefault();
                            e.target.style.opacity = "100%";
                        }}
                        onDrag={(e: any) => e.preventDefault}
                        onDragOver={(e: any) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "copy";
                        }}
                        onDrop={handle_drag_and_drop}
                    >
                        <Image
                            src={newAvatar || userInfo.avatar}
                            alt=""
                            className="object-cover h-full rounded-full"
                            width={150}
                            height={150}
                            sizes=""
                            decoding="async"
                        />
                    </Label>
                </div>
                <Separator orientation="horizontal" />
                <div className="flex w-full gap-4 my-6 justify-start">
                    <div className="grow max-w-md flex flex-col gap-2">
                        <h1 className="text-xl font-bold">
                            Update account information
                        </h1>
                        <h3 className="text-sm">
                            Change your email or username. Changing these will
                            result in a re-logging in
                        </h3>
                        <Input
                            type="text"
                            name="username"
                            placeholder={userInfo.username || "Username"}
                            id="username-input"
                            autoComplete="new-password"
                        />
                        <Input
                            type="text"
                            name="email"
                            placeholder={userInfo.email || "Email"}
                            id="email-input"
                            autoComplete="new-password"
                        />
                        <Button
                            className="w-fit text-secondary font-bold"
                            onClick={handle_account_update}
                        >
                            Update account
                        </Button>
                    </div>
                </div>
                <Separator orientation="horizontal" />
                <div className="flex w-full gap-4 my-6 justify-start">
                    <div className="grow max-w-md flex flex-col gap-2">
                        <h1 className="text-xl font-bold">Change password</h1>
                        <h3 className="text-sm">
                            Change your password, make sure to use a strong one
                            and not reuse password
                        </h3>
                        <Input
                            type="password"
                            name="old-password"
                            placeholder="Old password"
                            id="oldpassword-input"
                            autoComplete="new-password"
                        />
                        <Input
                            type="password"
                            name="new-password"
                            placeholder="New password"
                            id="newpassword-input"
                            onChange={(e) => setNewPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                        <Input
                            type="password"
                            name="confirm-password"
                            placeholder="Confirm password"
                            id="confirmpassword-input"
                            className={`${
                                newPassword === confirmPassword
                                    ? "focus-visible:border-green-500"
                                    : "focus-visible:border-red-500"
                            }`}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                        <Button
                            className="w-fit text-secondary font-bold"
                            onClick={handle_password_update}
                        >
                            Change password
                        </Button>
                    </div>
                </div>
                <Separator orientation="horizontal" />
                <div className="flex w-full gap-4 my-6 justify-start">
                    <div className="grow max-w-md flex flex-col gap-2">
                        <h1 className="text-xl font-bold text-destructive">
                            Delete account (WIP ⚠️)
                        </h1>
                        <h3 className="text-sm">
                            Type in your email and username to procced with
                            deletion. Be cautious, this action cannot be undone.
                        </h3>
                        <Input
                            type="text"
                            name="username"
                            placeholder="Username"
                            id="username-delete-input"
                            autoComplete="new-password"
                        />
                        <Input
                            type="text"
                            name="email"
                            placeholder="Email"
                            id="email-delete-input"
                            autoComplete="new-password"
                        />
                        <Button className="w-fit text-secondary font-bold bg-destructive" // onClick={handle_delete_update}
                        >
                            Delete account
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
