import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Nandor Table",
    description: "Developed by Nandor",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}
