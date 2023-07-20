"use client";

import axios, { AxiosError } from "axios";
import { FC, useState } from "react";
import Button from "./Button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GroupValidator } from "@/lib/validations/add-group";
import { toast } from "react-hot-toast";

interface CreateGroupButtonsProps {}

type FormData = z.infer<typeof GroupValidator>;

const CreateGroupButtons: FC<CreateGroupButtonsProps> = ({}) => {
	const [showSuccessState, setShowSuccessState] = useState<boolean>(false);

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isLoading },
	} = useForm<FormData>({
		resolver: zodResolver(GroupValidator),
	});

	const createGroup = async (group_name_input: string) => {
		try {
			// validate user input
			const { group_name } = GroupValidator.parse({
				group_name: group_name_input,
			});

			await toast.promise(
				axios.post("/api/groups/create", {
					group_name,
				}),
				{
					loading: "Loading",
					success: "Success",
					error: "An error occured.",
				}
			);

			setShowSuccessState(true);
		} catch (error) {
			// console.error(error);
			if (error instanceof z.ZodError) {
				setError("group_name", { message: error.message });
				return;
			}

			if (error instanceof AxiosError) {
				setError("group_name", { message: error.response?.data });
				return;
			}

			setError("group_name", {
				message: "Something went wrong! Please try again.",
			});
		}
	};

	const onSubmit = async (data: FormData) => {
		setShowSuccessState(false);
		await createGroup(data.group_name);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="max-w-sm">
			<label
				htmlFor="group_name"
				className="block text-sm font-medium leading-6 text-slate-900"
			>
				Choose your group name
			</label>

			<div className="mt-2 flex gap-4">
				<input
					{...register("group_name")}
					type="text"
					className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
					placeholder="Group_Name"
					required={true}
					onChange={() => setShowSuccessState(false)}
				/>
				<Button isLoading={isLoading}>
					{isLoading ? "Creating ..." : "Create"}
				</Button>
			</div>
			<p className="mt-1 text-sm text-red-600">
				{errors.group_name?.message}
			</p>
			{showSuccessState ? (
				<p className="mt-1 text-sm text-green-600">
					Group created successfully!
				</p>
			) : null}
		</form>
	);
};

export default CreateGroupButtons;
