import { Icon, Icons } from "@/Components/Icons";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import chatterboxLogo from "/public/chatterbox.png";
import { fetchRedis } from "@/helpers/redis";
import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
import SignOutButton from "@/Components/Buttons/SignOutButton";
import FriendRequestSidebarOptions from "@/Components/Sidebar/FriendRequestSidebarOptions";
import SidebarChatList from "@/Components/Sidebar/SidebarChatList";
import MobileChatLayout from "@/Components/MobileChatLayout";
import GroupRequestSidebarOptions from "@/Components/Sidebar/GroupRequestSidebarOptions";
import SidebarGroupChatList from "@/Components/Sidebar/SidebarGroupChatList";
import { SidebarOption } from "@/types/typings";

interface LayoutProps {
	children: ReactNode;
}

export const metadata = {
	title: "ChatterBox | Dashboard",
	description: "Your dashboard",
};

const sidebarOptions: SidebarOption[] = [
	{
		id: 1,
		name: "Add friend",
		href: "/dashboard/friend/add",
		Icon: "UserPlus",
	},
	{
		id: 2,
		name: "Create Group",
		href: "/dashboard/group/create",
		Icon: "Plus",
	},
	{
		id: 3,
		name: "Join Group",
		href: "/dashboard/group/join",
		Icon: "Users",
	},
	{
		id: 4,
		name: "Invite to join Group",
		href: "/dashboard/group/invite",
		Icon: "Merge",
	},
];

const Layout = async ({ children }: LayoutProps) => {
	const session = await getServerSession(authOptions);
	if (!session) notFound();

	const friends = await getFriendsByUserId(session.user.id);

	const unseenFriendRequestCount = (
		(await fetchRedis(
			"smembers",
			`user:${session.user.id}:incoming_friend_requests`
		)) as User[]
	).length;

	const groups = (await fetchRedis(
		"smembers",
		`user:${session.user.id}:groups`
	)) as Group[];

	let incomingSenderIdsPromises: Promise<string[]>[] = [];

	groups.map(async (group) => {
		incomingSenderIdsPromises.push(
			fetchRedis("smembers", `group:${group}:incoming_group_requests`)
		);
	});

	const incomingSenderIds = (await Promise.all(
		incomingSenderIdsPromises
	)) as string[][];

	const unseenJoinGroupRequestCount = incomingSenderIds.flat().length;

	return (
		<div className="w-full flex h-screen">
			<div className="md:hidden">
				<MobileChatLayout
					friends={friends}
					groups={groups}
					session={session}
					sidebarOptions={sidebarOptions}
					unseenFriendRequestCount={unseenFriendRequestCount}
				/>
			</div>
			<div className="hidden md:flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-slate-200 bg-white px-6">
				<Link
					href="/dashboard"
					className="flex h-16 shrink-0 items-center"
				>
					<Image src={chatterboxLogo} alt="" width={32} height={32} />
					{/* <Icons.Logo className="h-8 w-auto text-blue-700" /> */}
					<h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">
						ChatterBox
					</h2>
				</Link>

				<nav className="flex flex-1 flex-col">
					<ul role="list" className="flex flex-1 flex-col gap-y-7">
						<li>
							{friends.length > 0 ? (
								<>
									<div className="text-xs font-semibold leading-6 text-slate-400">
										Your Friends
									</div>
									<SidebarChatList
										sessionId={session.user.id}
										friends={friends}
									/>
								</>
							) : null}
						</li>
						<li>
							{groups.length > 0 ? (
								<>
									<div className="text-xs font-semibold leading-6 text-slate-400">
										Your Groups
									</div>
									<SidebarGroupChatList
										session={session}
										groups={groups}
									/>
								</>
							) : null}
						</li>

						<li>
							<div className="text-xs font-semibold leading-6 text-slate-400">
								Overview
							</div>
							<ul role="list" className="-mx-2 mt-2 space-y-1">
								{sidebarOptions.map((option) => {
									const Icon = Icons[option.Icon];
									return (
										<li key={option.id}>
											<Link
												href={option.href}
												className="text-slate-700 hover:text-blue-700 hover:bg-slate-100 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold hover:shadow"
											>
												<span className="text-slate-400 border-slate-200 group-hover:border-blue-700 group-hover:text-blue-700 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-medium bg-white">
													<Icon className="h-4 w-4" />
												</span>

												<span className="truncate">
													{option.name}
												</span>
											</Link>
										</li>
									);
								})}

								<li>
									<FriendRequestSidebarOptions
										sessionId={session.user.id}
										initialUnseenFriendRequestCount={
											unseenFriendRequestCount
										}
									/>
								</li>
								<li>
									<GroupRequestSidebarOptions
										sessionId={session.user.id}
										initialUnseenGroupRequestCount={
											unseenJoinGroupRequestCount
										}
									/>
								</li>
							</ul>
						</li>
						<li className="-mx-6 mt-auto flex items-center bg-slate-100">
							<div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-slate-900">
								<div className="relative h-8 w-8">
									<Image
										fill
										referrerPolicy="no-referrer"
										className="rounded-full"
										src={session.user.image || ""}
										alt="Your profile picture"
									/>
								</div>

								<span className="sr-only">Your Profile</span>
								<div className="flex flex-col">
									<span aria-hidden="true">
										{session.user.name}
									</span>
									<span
										className="text-xs text-zinc-400"
										aria-hidden="true"
									>
										{session.user.email}
									</span>
								</div>
							</div>
							<SignOutButton className="h-full aspect-square" />
						</li>
					</ul>
				</nav>
			</div>
			<aside className="max-h-screen container py-12 md:py-8 w-full">
				{children}
			</aside>
		</div>
	);
};

export default Layout;
