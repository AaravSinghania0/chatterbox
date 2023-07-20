"use client";

import Button from "@/Components/Buttons/Button";
import { signOut } from "next-auth/react";

export default function Home() {
	return <Button onClick={() => signOut}>Sign Out</Button>;
}
