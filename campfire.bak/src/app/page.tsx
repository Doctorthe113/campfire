import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/ui/darkModeToggle";
import Link from "next/link";

export default async function Home() {
  const guildId = "1234567890";
  return (
    <div className="flex h-screen w-screen items-start justify-center bg-gradient-to-br from-accent via-background to-background">
      <div className="flex flex-col items-center h-full w-full p-2">
        <div className="flex justify-between w-full">
          <h1 className="text-3xl font-bold">Campfire</h1>
          <DarkModeToggle />
        </div>
        <div className="flex flex-col items-center bg-card rounded-lg p-4">
          <h1>Welcome to Campfire</h1>
          <h3>This is a simple discord inspired chatapp</h3>
          <Button
            variant="default"
            className=""
            asChild
          >
            <Link href={`/chatroom/${guildId}`}>
              Enter
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
