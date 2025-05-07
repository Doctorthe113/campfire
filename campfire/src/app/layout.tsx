import { ThemeProvider } from "next-themes";
import { DM_Sans } from "next/font/google";
import { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const customFont = DM_Sans({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-custom",
    fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
    title: `Campfire ${process.env.NODE_ENV === "development" ? "- dev" : ""}`,
    description: "A simple discord like chatapp",
    authors: [{ name: "Doctorthe113" }],
    keywords: [
        "discord",
        "chatapp",
        "campfire",
        "discord clone",
        "campfire.doctorthe113.com",
        "discord.doctorthe113.com",
    ],
    openGraph: {
        title: `Campfire ${
            process.env.NODE_ENV === "development" ? "- dev" : ""
        }`,
        description: "A simple discord like chatapp",
        siteName: "Campfire",
        images: "https://campfire.doctorthe113.com/campfire.webp",
        locale: "en-US",
        type: "website",
        url: "https://campfire.doctorthe113.com",
    },
    robots: {
        index: true,
        follow: true,
        nocache: true,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        shortcut: "/favicon.ico",
        apple: "/campfire.webp",
    },
    twitter: {
        title: "Campfire",
        description: "A simple discord like chatapp",
        images: "https://campfire.doctorthe113.com/campfire.webp",
        creator: "@doctorthe113",
        site: "campfire.doctorthe113.com",
    },
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
                    <link
                        rel="icon"
                        href="/favicon.ico"
                        type="image/x-icon"
                    />
                </head>
                <body
                    className={`${customFont.variable} bg-background h-dvh w-screen font-sans`}
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
