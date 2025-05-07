import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import DarkModeToggle from "@/components/ui/darkModeToggle";
import { Label } from "@/components/ui/label";
import {
    ArrowRight,
    Chrome,
    Github,
    MonitorSmartphone,
    Smartphone,
    Twitter,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
    return (
        <main className="bg-background flex h-screen w-screen flex-col gap-3 items-center justify-start">
            <div
                className="bg-card w-full flex justify-center p-1 sticky top-0"
                id="header"
            >
                <div className="flex justify-between w-full max-w-3xl">
                    <Image
                        src={"/campfire.webp"}
                        width={512}
                        height={512}
                        alt=""
                        className="inline rounded-sm w-8 h-8 mr-1"
                    />
                    <h1 className="font-sans text-3xl font-bold">Campfire</h1>
                    <DarkModeToggle />
                </div>
            </div>
            <div
                className="h-max w-full max-w-3xl flex flex-col md:flex-row justify-start items-center rounded-sm"
                id="card"
            >
                <div className="landing-card-bg h-full w-full md:w-1/2 p-3 md:rounded-l-md md:rounded-t-none rounded-t-md flex flex-col items-center justify-end text-center">
                    <h1 className="font-sans text-3xl font-bold text-primary">
                        Welcome to Campfire
                    </h1>
                    <h6 className="text-xs text-accent">
                        *This image was AI generated because I am poor :(
                    </h6>
                </div>
                <Card className="flex flex-col w-full md:w-1/2 px-2 rounded-none md:border-l-0 md:rounded-l-none md:rounded-t-md rounded-b-md justify-start items-center gap-2 text-center border-0">
                    <h3 className="text-sm">
                        <strong className="text-lg">
                            Campfire is a discord inspired chatapp.
                        </strong>
                        <br />
                        I made it for fun and to learn about NextJS, BunJS,
                        ShadCN, Auth, Cookies, SQL ,and more. This is built
                        entirely from scratch. Only external libraries used are
                        Jose for signing and verifying JWT tokens, ShadCN's
                        radix and lucide. I plan on adding new features and
                        fixing bugs over time. You can check out my github from
                        below. Currently in alpha.
                    </h3>
                    <div className="flex gap-2 w-full flex-wrap justify-center">
                        <Button
                            variant={"link"}
                            className="text-secondary font-bold"
                            asChild
                        >
                            <Link href={"https://github.com/doctorthe113"}>
                                Github
                                <Github />
                            </Link>
                        </Button>
                        <Button
                            variant={"link"}
                            className="text-secondary font-bold"
                            asChild
                        >
                            <Link href={"https://x.com/Doctorthe113"}>
                                Follow
                                <Twitter />
                            </Link>
                        </Button>
                        <Button
                            variant="link"
                            className="text-secondary font-bold"
                            asChild
                        >
                            <Link href={`/login`}>
                                Get started
                                <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                </Card>
            </div>
            <div className="h-max w-full max-w-3xl gap-3 flex sm:flex-row flex-col">
                <Card className="h-max w-full p-2 gap-3 rounded-sm border-0">
                    <h1 className="font-sans text-xl font-bold">
                        Upcoming features
                    </h1>
                    <div className="flex gap-2 ml-8">
                        <Checkbox
                            checked={true}
                            disabled
                            className="disabled:opacity-100"
                            id="first-checkbox"
                        >
                        </Checkbox>
                        <Label
                            htmlFor="first-checkbox"
                            className="text-foreground peer-disabled:opacity-100"
                        >
                            Adding Dark/Light mode
                        </Label>
                    </div>
                    <div className="flex gap-2 ml-8">
                        <Checkbox
                            checked={false}
                            disabled
                            className="cursor-default disabled:opacity-100"
                            id="second-checkbox"
                        >
                        </Checkbox>
                        <Label
                            htmlFor="second-checkbox"
                            className="text-foreground peer-disabled:opacity-100"
                        >
                            Adding encryption
                        </Label>
                    </div>
                    <div className="flex gap-2 ml-8">
                        <Checkbox
                            checked={true}
                            disabled
                            className="cursor-default disabled:opacity-100"
                            id="third-checkbox"
                        >
                        </Checkbox>
                        <Label
                            htmlFor="third-checkbox"
                            className="text-foreground peer-disabled:opacity-100"
                        >
                            Add support for mobile
                        </Label>
                    </div>
                    <div className="flex gap-2 ml-8">
                        <Checkbox
                            checked={false}
                            disabled
                            className="cursor-default disabled:opacity-100"
                            id="fourth-checkbox"
                        >
                        </Checkbox>
                        <Label
                            htmlFor="fourth-checkbox"
                            className="text-foreground peer-disabled:opacity-100"
                        >
                            Adding profile control/settings
                        </Label>
                    </div>
                </Card>
                <Card className="h-full w-full p-2 gap-1 leading-tight rounded-sm border-0">
                    <h1 className="font-sans text-xl font-bold">
                        Supports all platforms
                    </h1>
                    <h3 className="text-sm grow">
                        Campfire is web based. It was originally designed for
                        desktop browser but it is mobile compatible.
                    </h3>
                    <div className="flex h-max justify-center gap-2 text-primary">
                        <MonitorSmartphone />
                        <Smartphone />
                        <Chrome />
                    </div>
                </Card>
            </div>
        </main>
    );
}
