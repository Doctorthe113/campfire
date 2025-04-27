"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "./button";

export default function DarkModeToggle() {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div
            className="grow flex justify-end h-full pb-0.5"
            suppressHydrationWarning
        >
            {!mounted ? null : (
                <Button
                    variant="default"
                    className={"bg-primary h-full aspect-square text-secondary border-foreground"}
                    size="icon"
                    onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")}
                >
                    {theme === "dark" ? <Moon /> : <Sun />}
                </Button>
            )}
        </div>
    );
}
