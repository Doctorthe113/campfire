import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/ui/darkModeToggle";
import Link from "next/link";

export default async function Home() {
    return (
        <main className="bg-background flex h-screen w-screen flex-col items-center justify-start">
            <div
                className="bg-card flex w-full justify-between p-2"
                id="header"
            >
                <h1 className="font-sans text-3xl font-bold">Campfire</h1>
                <DarkModeToggle />
            </div>
            <div
                className="bg-card m-2 flex flex-col items-center rounded-lg p-4"
                id="card"
            >
                <h1>Welcome to Campfire</h1>
                <h3>This is a simple discord inspired chatapp</h3>
                <Button variant="default" className="" asChild>
                    <Link href={`/login`}>Enter</Link>
                </Button>
            </div>
        </main>
    );
}
