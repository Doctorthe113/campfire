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
    title: `Campfire ${process.env.NODE_ENV === "development" ? "- dev" : ""}`,
    description: "A simple discord like chatapp",
    openGraph: {
        title: `Campfire ${
            process.env.NODE_ENV === "development" ? "- dev" : ""
        }`,
        description: "A simple discord like chatapp",
        siteName: "Campfire",
        images: [],
        locale: "en-US",
        type: "website",
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
                        href="/campfire.webp"
                        type="image/x-icon"
                    />
                </head>
                <body
                    className={`${oxanium.variable} ${merriweather.variable} bg-background h-dvh w-screen font-sans`}
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
