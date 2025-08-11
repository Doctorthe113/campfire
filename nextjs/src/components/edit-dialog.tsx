"use client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pen } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useState } from "react";

export function EditDialog(
    { msgId, updateMessage }: { msgId: string; updateMessage: Function },
) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild className="p-0 m-0 rounded-none">
                <Button
                    variant="outline"
                    className="w-6 h-6 rounded-sm border-0"
                >
                    <Pen />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit message</DialogTitle>
                    <DialogDescription>
                        Make changes to your message
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 py-4">
                    <div className="flex flex-col items-center gap-2">
                        <Label htmlFor="message" className="w-full text-left">
                            New message
                        </Label>
                        <Textarea id="message" className="col-span-3">
                        </Textarea>
                    </div>
                </div>
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
                        onClick={(e) => {
                            setIsOpen(false);
                            updateMessage(
                                e,
                                msgId,
                                (document.getElementById(
                                    "message",
                                ) as HTMLInputElement).value,
                            );
                        }}
                    >
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
