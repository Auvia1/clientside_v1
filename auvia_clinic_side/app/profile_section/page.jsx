"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import {
	FiX,
	FiPhone,
	FiCalendar,
	FiUser,
	FiShield,
	FiBookOpen,
	FiMessageCircle,
	FiAlertCircle,
	FiLogOut,
} from "react-icons/fi";

export default function ProfileSectionPage() {
	const router = useRouter();
	const [onDuty, setOnDuty] = useState(true);

	const handleLogout = () => {
  localStorage.removeItem("auvia_user");
  router.push("/authentication"); // or "/"
};

	return (
		<div className="min-h-screen bg-[#f5f8fb] text-slate-900">
			<div className="flex min-h-screen items-center justify-center px-4 py-10">
				<Card className="w-full max-w-sm border-slate-100 shadow-xl">
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
								Staff Profile
							</CardTitle>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 rounded-full p-0"
								onClick={() => router.push("/")}
								aria-label="Close"
							>
								<FiX />
							</Button>
						</div>
					</CardHeader>
					<CardContent className="space-y-5">
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
								My Daily Performance
							</p>
							<div className="mt-3 grid grid-cols-2 gap-3">
								<div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow">
									<div className="flex items-center gap-2 text-slate-400">
										<FiPhone />
										<span className="text-[10px] uppercase">Calls Handled</span>
									</div>
									<p className="mt-2 text-2xl font-semibold text-slate-800">42</p>
								</div>
								<div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow">
									<div className="flex items-center gap-2 text-slate-400">
										<FiCalendar />
										<span className="text-[10px] uppercase">Appts Booked</span>
									</div>
									<p className="mt-2 text-2xl font-semibold text-slate-800">18</p>
								</div>
							</div>
						</div>

						<div>
							<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
								My Account
							</p>
							<div className="mt-3 space-y-2">
								<div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow">
									<div className="flex items-center gap-3">
										<FiUser className="text-slate-400" />
										<span>Edit Profile</span>
									</div>
									<span className="text-slate-300">›</span>
								</div>
								<div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow">
									<div className="flex items-center gap-3">
										<FiShield className="text-slate-400" />
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
								<div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow">
									<div className="flex items-center gap-3">
										<FiBookOpen className="text-slate-400" />
										<span>User Guide</span>
									</div>
									<span className="text-slate-300">›</span>
								</div>
								<div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow">
									<div className="flex items-center gap-3">
										<FiMessageCircle className="text-slate-400" />
										<span>Live Chat Support</span>
									</div>
									<span className="text-slate-300">›</span>
								</div>
								<div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow">
									<div className="flex items-center gap-3">
										<FiAlertCircle className="text-slate-400" />
										<span>Report an Issue</span>
									</div>
									<span className="text-slate-300">›</span>
								</div>
							</div>
						</div>

						<Button
  className="w-full rounded-full bg-[var(--brand-secondary)] text-white hover:opacity-90"
  onClick={handleLogout}
>
  <FiLogOut className="mr-2" /> Sign Out
</Button>

						<div className="flex items-center justify-center gap-4 text-[10px] text-slate-400">
							<span>Privacy</span>
							<span>Terms</span>
							<span>Version 3.1.0</span>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
