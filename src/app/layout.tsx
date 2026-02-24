import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Milandhoo Prayer Times",
    description: "Accurate prayer times for Milandhoo, Maldives",
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
