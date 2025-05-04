"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function ProfileInterface({ userInfo }: { userInfo: any }) {
    const [username, setUsername] = useState("");
    const [status, setStatus] = useState("");
    const [newAvatar, setNewAvatar] = useState("");
    const [email, setEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // todo: when browser gets fixed
    // const handle_drag_and_drop = (e: any) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     e.target.style.opacity = "100%";
    //     let file = e.dataTransfer.files[0];
    //     console.log(file);
    // };

    const handle_profile_update = async () => {};

    const handle_account_update = async () => {};

    const handle_password_update = async () => {};

    // todo add the plus icon on image upload hover
    return (
        <div className="flex flex-col grow h-full w-full overflow-scroll min-h-0 px-4 items-center">
            <div className="flex w-full gap-4 my-6 justify-start">
                <div className="grow max-w-md flex flex-col gap-2">
                    <h1 className="text-xl font-bold">Update Profile</h1>
                    <h3 className="text-sm">
                        Update status and profile picture
                    </h3>
                    <Input
                        type="text"
                        name="status"
                        placeholder={userInfo.status || "Status"}
                        id=""
                        onChange={(e) => setStatus(e.target.value)}
                    />
                    <Button className="w-fit text-secondary font-bold">
                        Update
                    </Button>
                </div>
                <Input type="file" name="avatar" id="avatar-input" hidden />
                <Label
                    htmlFor="avatar-input"
                    className="aspect-square h-full rounded-full hover:opacity-50"
                >
                    <img
                        src={newAvatar || userInfo.avatar}
                        alt=""
                        className="object-cover h-full rounded-full"
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
                        Change your email or username
                    </h3>
                    <Input
                        type="text"
                        name="username"
                        placeholder={userInfo.username || "Username"}
                        id=""
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input
                        type="text"
                        name="email"
                        placeholder={userInfo.email || "Email"}
                        id=""
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button className="w-fit text-secondary font-bold">
                        Update
                    </Button>
                </div>
            </div>
            <Separator orientation="horizontal" />
            <div className="flex w-full gap-4 my-6 justify-start">
                <div className="grow max-w-md flex flex-col gap-2">
                    <h1 className="text-xl font-bold">Change password</h1>
                    <h3 className="text-sm">
                        Change your password, make sure to use a strong one and
                        not reuse password
                    </h3>
                    <Input
                        type="password"
                        name="old-password"
                        placeholder="Old password"
                        id=""
                        onChange={(e) => setOldPassword(e.target.value)}
                    />
                    <Input
                        type="password"
                        name="new-password"
                        placeholder="New password"
                        id=""
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Input
                        type="password"
                        name="confirm-password"
                        placeholder="Confirm password"
                        id=""
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button className="w-fit text-secondary font-bold">
                        Change password
                    </Button>
                </div>
            </div>
        </div>
    );
}
