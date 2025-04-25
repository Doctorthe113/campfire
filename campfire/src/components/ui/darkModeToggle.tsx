"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "./button";

export default function DarkModeToggle() {
    const { setTheme, theme } = useTheme();

    return (
        <div className="grow flex justify-end h-full pb-0.5">
            <Button
                variant="default"
                className={theme === "dark"
                    ? "bg-primary h-full aspect-square text-secondary border-2 border-foreground"
                    : "bg-primary h-full aspect-square text-secondary border-2 border-foreground"}
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
                {theme === "dark" ? <Moon /> : <Sun />}
            </Button>
        </div>
    );
}
