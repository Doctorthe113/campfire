import { ThemeProvider } from "next-themes";
import { Merriweather, Oxanium } from "next/font/google";
import { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const oxanium = Oxanium({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-oxanium",
});

const merriweather = Merriweather({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-merriweather",
});

export const metadata: Metadata = {
    title: "Campfire",
    description: "A simple discord like chatapp",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <html lang="en" suppressHydrationWarning>
                <head>
                    <meta name="darkreader-lock" />
                </head>
                <body
                    className={`${oxanium.variable} ${merriweather.variable} bg-background h-screen w-screen font-sans transition-all duration-300`}
                >
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <>{children}</>
                        <Toaster />
                    </ThemeProvider>
                </body>
            </html>
        </>
    );
}
