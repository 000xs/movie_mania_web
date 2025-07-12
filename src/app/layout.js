import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Movie Mania Dashboard",
  description: "Manage your movie and TV series collection",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        
        <main>{children}</main>
      </body>
    </html>
  );
}
