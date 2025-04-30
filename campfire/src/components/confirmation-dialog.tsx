"use client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export function ConfirmationDialog(
    { children, confirmationMsg, confirmationFunction }: {
        children: React.ReactNode;
        confirmationMsg: string;
        confirmationFunction: Function;
    },
) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild className="p-0 m-0 rounded-none">
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogDescription>
                        {confirmationMsg}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        type="button"
                        variant={"outline"}
                        className="text-foreground font-bold"
                        onClick={() => {
                            setIsOpen(false);
                        }}
                    >
                        Close
                    </Button>
                    <Button
                        type="button"
                        className="text-secondary font-bold"
                        onClick={() => {
                            setIsOpen(false);
                            confirmationFunction();
                        }}
                    >
                        Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
