"use client";

import Link from "next/link";
import { Search, Bell, Moon, User } from "lucide-react";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";

export default function Navbar({ activeMonitoring, onToggleMonitoring }) {
	return (
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
				<Link href="/profile_section" className="inline-flex">
					<Button
						variant="outline"
						size="sm"
						className="h-9 w-9 rounded-full p-0"
						aria-label="Profile"
					>
						<User className="h-4 w-4 text-slate-600" />
					</Button>
				</Link>
			</div>
		</header>
	);
}
