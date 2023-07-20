"use client";

import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { User } from "lucide-react";
import Link from "next/link";
import { FC, useEffect, useState } from "react";

interface FriendRequestSidebarOptionsProps {
	sessionId: string;
	initialUnseenFriendRequestCount: number;
}

const FriendRequestSidebarOptions: FC<FriendRequestSidebarOptionsProps> = ({
	sessionId,
	initialUnseenFriendRequestCount,
}) => {
	const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
		initialUnseenFriendRequestCount
	);

	useEffect(() => {
		pusherClient.subscribe(
			toPusherKey(`user:${sessionId}:incoming_friend_requests`)
		);
		pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

		const friendRequestHandler = () => {
			setUnseenRequestCount((prev) => prev + 1);
		};

		const addedFriendHandler = () => {
			setUnseenRequestCount((prev) => prev - 1);
		};

		pusherClient.bind("incoming_friend_requests", friendRequestHandler);
		pusherClient.bind("new_friend", addedFriendHandler);

		return () => {
			pusherClient.unsubscribe(
				toPusherKey(`user:${sessionId}:incoming_friend_requests`)
			);
			pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));

			pusherClient.unbind("new_friend", addedFriendHandler);
			pusherClient.unbind(
				"incoming_friend_requests",
				friendRequestHandler
			);
		};
	}, [sessionId]);

	return (
		<Link
			href="/dashboard/friend/requests"
			className="text-slate-700 hover:text-blue-700 hover:bg-slate-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold hover:shadow"
		>
			<div className="text-slate-400 border-slate-200 group-hover:border-blue-700 group-hover:text-blue-700 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-medium bg-white">
				<User className="h-4 w-4" />
			</div>
			<p className="truncate">Friend Requests</p>

			{unseenRequestCount > 0 ? (
				<div className="rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-blue-700">
					{unseenRequestCount}
				</div>
			) : null}
		</Link>
	);
};

export default FriendRequestSidebarOptions;
