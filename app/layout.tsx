import AuthContext from "./context/AuthContext";
import ToasterContext from "./context/ToasterContext";
import "./globals.css";
import { Inter } from "next/font/google";
import { ReactQueryContext } from "./context/ReactQueryContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "nextjs-boilerplate",
  description: "nextjs-boilerplate",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactQueryContext>
      <html lang="en">
        <body className={inter.className}>
          <AuthContext>
            <ToasterContext />
            {children}
          </AuthContext>
        </body>
      </html>
    </ReactQueryContext>
  );
}
