import Providers from "@/Components/Providers";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "ChatterBox | Chat with your friends",
	description:
		"Welcome to ChatterBox, a real-time messaging web app powered by Next 13 and Redis.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
