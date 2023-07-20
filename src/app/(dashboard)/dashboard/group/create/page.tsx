import { FC } from "react";
import CreateGroupButton from "@/Components/Buttons/CreateGroupButton";

const page: FC = () => {
	return (
		<main className="pt-8">
			<h1 className="font-bold text-5xl mb-8">Create a new group</h1>
			<CreateGroupButton />
		</main>
	);
};

export default page;
