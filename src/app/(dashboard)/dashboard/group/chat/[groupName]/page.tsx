import GroupChatInput from "@/Components/GroupChatInput";
import GroupMessages from "@/Components/GroupMessages";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { messageArrayValidator } from "@/lib/validations/message";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

interface PageProps {
	params: {
		groupName: string;
	};
}

export async function generateMetadata({ params }: PageProps) {
	const session = await getServerSession(authOptions);
	if (!session) notFound();
	const { user } = session;

	const { groupName } = params;
	if (!groupName) notFound();

	const userGroupNames = await fetchRedis(
		"smembers",
		`user:${user.id}:groups`
	);

	if (!userGroupNames.includes(groupName)) {
		notFound();
	}

	return {
		title: `ChatterBox | ${groupName}`,
		description: "Group chat",
	};
}

async function getChatMessages(groupName: string) {
	try {
		const results: string[] = await fetchRedis(
			"zrange",
			`chat:${groupName}:messages`,
			0,
			-1
		);

		const dbMessages = results.map(
			(message) => JSON.parse(message) as Message
		);

		const reversedDbMessages = dbMessages.reverse();

		return messageArrayValidator.parse(reversedDbMessages);
	} catch (error) {
		console.error(error);
		notFound();
	}
}

const page = async ({ params }: PageProps) => {
	const { groupName } = params;
	const session = await getServerSession(authOptions);
	if (!session) notFound();

	const { user } = session;

	if (!groupName) {
		notFound();
	}

	const userGroupNames = await fetchRedis(
		"smembers",
		`user:${user.id}:groups`
	);

	// check if the user has the right to chat in this group
	if (!userGroupNames.includes(groupName)) {
		notFound();
	}

	const groupMembersIds = (await fetchRedis(
		"smembers",
		`group:${groupName}:group-members`
	)) as string[];

	const groupMembers = (await Promise.all(
		groupMembersIds.map(
			async (groupMemberId) =>
				await fetchRedis("get", `user:${groupMemberId}`)
		)
	)) as string[];

	const chatPartners = groupMembers.map((groupMember) =>
		JSON.parse(groupMember)
	) as User[];

	const initialMessages = await getChatMessages(groupName);

	return (
		<div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
			<div className="flex sm:items-center justify-between py-3 border-b-2 border-slate-200">
				<div className="relative flex items-center space-x-4">
					<div className="flex flex-col leading-tight">
						<div className="text-xl flex items-center">
							<span className="text-slate-700 mr-3 font-semibold">
								Welcome to {groupName}
							</span>
						</div>
					</div>
				</div>
			</div>

			<GroupMessages
				chatId={groupName}
				chatPartners={chatPartners}
				sessionImg={session.user.image}
				sessionId={session.user.id}
				initialGroupMessages={initialMessages}
			/>
			<GroupChatInput groupName={groupName} />
		</div>
	);
};

export default page;
