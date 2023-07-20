"use client";

import { pusherClient } from "@/lib/pusher";
import { cn, toPusherKey } from "@/lib/utils";
import { Message } from "@/lib/validations/message";
import { format } from "date-fns";
import Image from "next/image";
import { FC, useEffect, useRef, useState } from "react";

interface GroupMessagesProps {
	initialGroupMessages: Message[];
	sessionId: string;
	chatId: string;
	sessionImg: string | null | undefined;
	chatPartners: User[];
}

const GroupMessages: FC<GroupMessagesProps> = ({
	initialGroupMessages,
	sessionId,
	chatId,
	chatPartners,
	sessionImg,
}) => {
	const [groupMessages, setGroupMessages] =
		useState<Message[]>(initialGroupMessages);

	useEffect(() => {
		pusherClient.subscribe(toPusherKey(`chat:${chatId}`));

		const messageHandler = (message: Message) => {
			setGroupMessages((prev) => [message, ...prev]);
		};

		pusherClient.bind("incoming-message", messageHandler);

		return () => {
			pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
			pusherClient.unbind("incoming-message", messageHandler);
		};
	}, [chatId]);

	const scrollDownRef = useRef<HTMLDivElement | null>(null);

	const formatTimestamp = (timestamp: number) => {
		return format(timestamp, "hh:mm a");
	};

	return (
		<div
			id="groupMessages"
			className="flex h-full flex-1 flex-col-reverse gap-2 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
		>
			<div ref={scrollDownRef} />

			{groupMessages.map((message, index) => {
				const isCurrentUser = message.senderId === sessionId;
				const sender = chatPartners.find(
					(s) => s.id === message.senderId
				);
				if (!sender) return null; // should never happen

				const hasNextMessageFromSameUser =
					groupMessages[index - 1]?.senderId ===
					groupMessages[index].senderId;

				return (
					<div
						className="chat-message"
						key={`${message.id}-${message.timestamp}`}
					>
						<div
							className={cn("flex items-end", {
								"justify-end": isCurrentUser,
							})}
						>
							<div
								className={cn(
									"flex flex-col space-y-0 text-base max-w-xs mx-2",
									{
										"order-1 items-end": isCurrentUser,
										"order-2 items-start": !isCurrentUser,
									}
								)}
							>
								<span
									className={cn(
										"px-4 py-2 rounded-lg inline-block",
										{
											"bg-blue-700 text-white":
												isCurrentUser,
											"bg-slate-200 text-slate-900":
												!isCurrentUser,
											"rounded-br-none":
												!hasNextMessageFromSameUser &&
												isCurrentUser,
											"rounded-bl-none":
												!hasNextMessageFromSameUser &&
												!isCurrentUser,
										}
									)}
								>
									{message.text}{" "}
									<span className="ml-2 text-xs text-slate-400">
										{formatTimestamp(message.timestamp)}
									</span>
								</span>
							</div>

							<div
								className={cn("relative w-6 h-6", {
									"order-2": isCurrentUser,
									"order-1": !isCurrentUser,
									invisible: hasNextMessageFromSameUser,
								})}
							>
								<Image
									fill
									src={
										isCurrentUser
											? (sessionImg as string)
											: sender.image
									}
									alt="Profile picture"
									referrerPolicy="no-referrer"
									className="rounded-full"
								/>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default GroupMessages;
