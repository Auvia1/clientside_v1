"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Search,
	Bell,
	Moon,
	User,
	X,
	UserCog,
	Shield,
	BookOpenText,
	MessageCircle,
	AlertTriangle,
	LogOut,
} from "lucide-react";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogClose,
	DialogDescription,
} from "./ui/dialog";

export default function Navbar({ activeMonitoring, onToggleMonitoring }) {
	const router = useRouter();
	const [profileOpen, setProfileOpen] = useState(false);
	const [onDuty, setOnDuty] = useState(true);

	const handleLogout = () => {
		localStorage.removeItem("auvia_user");
		setProfileOpen(false);
		router.push("/authentication");
	};

	return (
		<>
			<header className="flex items-center justify-between gap-6">
				<div className="relative flex w-full max-w-xl items-center">
					<Search className="absolute left-3 h-4 w-4 text-slate-400" />
					<Input
						className="h-10 rounded-full border-slate-200 bg-white pl-9 text-sm"
						placeholder="Search patients or operations..."
					/>
				</div>

				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2 rounded-full border border-[#00A3AD] bg-white px-3 py-1 text-[11px] text-(--brand-secondary)">
						<span className="font-semibold text-[#00A3AD]">Activate Agent</span>
						<Switch
							checked={activeMonitoring}
							onCheckedChange={onToggleMonitoring}
						/>
					</div>
					<Button variant="outline" size="sm" className="h-9 w-9 rounded-full p-0">
						<Bell className="h-4 w-4 text-slate-600" />
					</Button>
					<Button variant="outline" size="sm" className="h-9 w-9 rounded-full p-0">
						<Moon className="h-4 w-4 text-slate-600" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="h-9 w-9 rounded-full p-0"
						aria-label="Profile"
						onClick={() => setProfileOpen(true)}
					>
						<User className="h-4 w-4 text-slate-600" />
					</Button>
				</div>
			</header>

			<Dialog open={profileOpen} onOpenChange={setProfileOpen}>
				<DialogContent className="w-[95vw] max-w-sm border-slate-100 p-0 shadow-xl">
					<DialogHeader className="border-b border-slate-100 px-5 py-4">
						<div className="flex items-center justify-between">
							<div>
								<DialogTitle className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
									Staff Profile
								</DialogTitle>
								<DialogDescription className="sr-only">
									Staff profile options and support actions
								</DialogDescription>
							</div>
							<DialogClose asChild>
								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 rounded-full p-0"
									aria-label="Close"
								>
									<X className="h-4 w-4" />
								</Button>
							</DialogClose>
						</div>
					</DialogHeader>

					<div className="space-y-5 px-5 py-5">
						<div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
							<div className="flex items-center gap-3">
								<div className="relative">
									<div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-600">
										LP
									</div>
									<span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
								</div>
								<div>
									<p className="text-sm font-semibold text-slate-800">Lakshmi Priya</p>
									<p className="text-xs text-slate-400">Front Desk Lead</p>
								</div>
							</div>
							<div className="flex items-center gap-2 text-xs text-slate-500">
								<span>On Duty</span>
								<Switch checked={onDuty} onCheckedChange={setOnDuty} />
							</div>
						</div>

						<div>
							<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
								My Account
							</p>
							<div className="mt-3 space-y-2">
								<div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700">
									<div className="flex items-center gap-3">
										<UserCog className="h-4 w-4 text-slate-400" />
										<span>Edit Profile</span>
									</div>
									<span className="text-slate-300">›</span>
								</div>
								<div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700">
									<div className="flex items-center gap-3">
										<Shield className="h-4 w-4 text-slate-400" />
										<span>Security Settings</span>
									</div>
									<span className="text-slate-300">›</span>
								</div>
							</div>
						</div>

						<div>
							<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
								Help & Support
							</p>
							<div className="mt-3 space-y-2">
								<div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700">
									<div className="flex items-center gap-3">
										<BookOpenText className="h-4 w-4 text-slate-400" />
										<span>User Guide</span>
									</div>
									<span className="text-slate-300">›</span>
								</div>
								<div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700">
									<div className="flex items-center gap-3">
										<MessageCircle className="h-4 w-4 text-slate-400" />
										<span>Live Chat Support</span>
									</div>
									<span className="text-slate-300">›</span>
								</div>
								<div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700">
									<div className="flex items-center gap-3">
										<AlertTriangle className="h-4 w-4 text-slate-400" />
										<span>Report an Issue</span>
									</div>
									<span className="text-slate-300">›</span>
								</div>
							</div>
						</div>

						<Button
							className="w-full rounded-full bg-(--brand-secondary) text-white hover:opacity-90"
							onClick={handleLogout}
						>
							<LogOut className="mr-2 h-4 w-4" /> Sign Out
						</Button>

						<div className="flex items-center justify-center gap-4 text-[10px] text-slate-400">
							<span>Privacy</span>
							<span>Terms</span>
							<span>Version 3.1.0</span>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
