// "use client";

// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { LayoutGrid, CalendarDays, PhoneCall, Menu, X, LogOut } from "lucide-react";
// import { Badge } from "./ui/badge";

// const navItems = [
// 	{ label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
// 	{ label: "Schedule", href: "/schedule", icon: CalendarDays },
// ];

// const assistantItems = [
// 	{ label: "Calls & Logs", href: "/calls_and_logs", icon: PhoneCall, badge: "12" },
// ];

// export default function Sidebar() {
// 	const pathname = usePathname();
// 	const router = useRouter();
// 	const activePath = pathname === "/" ? "/dashboard" : pathname;
// 	const [open, setOpen] = useState(false);
// 	const [mobileOpen, setMobileOpen] = useState(false);

// 	function handleLogout() {
// 		localStorage.removeItem("auvia_user");
// 		router.push("/");
// 	}

// 	const user = (() => {
// 		if (typeof window === "undefined") return null;
// 		try { return JSON.parse(localStorage.getItem("auvia_user") || "null"); } catch { return null; }
// 	})();

// 	const initials = user?.name
// 		? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
// 		: "LP";

// 	const SidebarContent = ({ animate: doAnimate = true }) => (
// 		<div className="flex flex-col h-full gap-5">
// 			{/* Logo */}
// 			<Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden py-1">
// 				<div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-linear-to-br from-emerald-600 to-green-600 text-sm font-bold text-white">
// 					A
// 				</div>
// 				{doAnimate ? (
// 					<motion.span
// 						animate={{ display: open ? "inline-block" : "none", opacity: open ? 1 : 0 }}
// 						className="text-base font-semibold text-slate-900 whitespace-pre"
// 					>
// 						Auvia
// 					</motion.span>
// 				) : (
// 					<span className="text-base font-semibold text-slate-900">Auvia</span>
// 				)}
// 			</Link>

// 			{/* Clinic Ops */}
// 			<div className="flex flex-col gap-1">
// 				{doAnimate && open && (
// 					<p className="px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
// 						Clinic Ops
// 					</p>
// 				)}
// 				{navItems.map((item) => {
// 					const Icon = item.icon;
// 					const isActive = activePath === item.href;
// 					return (
// 						<Link
// 							key={item.href}
// 							href={item.href}
// 							className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-colors ${
// 								isActive
// 									? "bg-emerald-50 text-emerald-700"
// 									: "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
// 							}`}
// 						>
// 							<Icon size={18} className="shrink-0" />
// 							<motion.span
// 								animate={
// 									doAnimate
// 										? { display: open ? "inline-block" : "none", opacity: open ? 1 : 0 }
// 										: {}
// 								}
// 								className="whitespace-pre text-sm"
// 							>
// 								{item.label}
// 							</motion.span>
// 						</Link>
// 					);
// 				})}
// 			</div>

// 			{/* Virtual Assistant */}
// 			<div className="flex flex-col gap-1">
// 				{doAnimate && open && (
// 					<p className="px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
// 						Virtual Assistant
// 					</p>
// 				)}
// 				{assistantItems.map((item) => {
// 					const Icon = item.icon;
// 					const isActive = activePath === item.href;
// 					return (
// 						<Link
// 							key={item.href}
// 							href={item.href}
// 							className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-colors ${
// 								isActive
// 									? "bg-emerald-50 text-emerald-700"
// 									: "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
// 							}`}
// 						>
// 							<Icon size={18} className="shrink-0" />
// 							<motion.span
// 								animate={
// 									doAnimate
// 										? { display: open ? "inline-block" : "none", opacity: open ? 1 : 0 }
// 										: {}
// 								}
// 								className="whitespace-pre text-sm flex-1"
// 							>
// 								{item.label}
// 							</motion.span>
// 							{item.badge && open && (
// 								<Badge variant="info" className="ml-auto shrink-0">
// 									{item.badge}
// 								</Badge>
// 							)}
// 						</Link>
// 					);
// 				})}
// 			</div>

// 			{/* Bottom: user + logout */}
// 			<div className="mt-auto flex flex-col gap-2 border-t border-slate-100 pt-4">
// 				<div className="flex items-center gap-2.5 overflow-hidden px-1">
// 					<div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
// 						{initials}
// 					</div>
// 					{doAnimate ? (
// 						<motion.div
// 							animate={{ display: open ? "block" : "none", opacity: open ? 1 : 0 }}
// 							className="min-w-0"
// 						>
// 							<p className="text-sm font-semibold text-slate-800 truncate">
// 								{user?.name || "Lakshmi Priya"}
// 							</p>
// 							<p className="text-xs text-slate-400">Front Desk Lead</p>
// 						</motion.div>
// 					) : (
// 						<div className="min-w-0">
// 							<p className="text-sm font-semibold text-slate-800 truncate">
// 								{user?.name || "Lakshmi Priya"}
// 							</p>
// 							<p className="text-xs text-slate-400">Front Desk Lead</p>
// 						</div>
// 					)}
// 				</div>
// 				<button
// 					onClick={handleLogout}
// 					className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
// 				>
// 					<LogOut size={16} className="shrink-0" />
// 					{(!doAnimate || open) && <span className="whitespace-pre">Sign Out</span>}
// 				</button>
// 			</div>
// 		</div>
// 	);

// 	return (
// 		<>
// 			{/* Desktop: animated collapsible */}
// 			<motion.aside
// 				className="hidden lg:flex h-full flex-col border-r border-slate-100 bg-white px-3 py-5 overflow-hidden"
// 				animate={{ width: open ? 220 : 60 }}
// 				transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 28 }}
// 				onMouseEnter={() => setOpen(true)}
// 				onMouseLeave={() => setOpen(false)}
// 			>
// 				<SidebarContent animate />
// 			</motion.aside>

// 			{/* Mobile: hamburger + slide-in drawer */}
// 			<div className="lg:hidden">
// 				<div className="flex h-12 items-center justify-between border-b border-slate-100 bg-white px-4">
// 					<div className="flex items-center gap-2">
// 						<div className="grid h-7 w-7 place-items-center rounded-lg bg-linear-to-br from-emerald-600 to-green-600 text-xs font-bold text-white">
// 							A
// 						</div>
// 						<span className="text-sm font-semibold text-slate-900">Auvia</span>
// 					</div>
// 					<button onClick={() => setMobileOpen(true)} className="text-slate-600">
// 						<Menu size={20} />
// 					</button>
// 				</div>
// 				<AnimatePresence>
// 					{mobileOpen && (
// 						<motion.div
// 							initial={{ x: "-100%", opacity: 0 }}
// 							animate={{ x: 0, opacity: 1 }}
// 							exit={{ x: "-100%", opacity: 0 }}
// 							transition={{ duration: 0.25, ease: "easeInOut" }}
// 							className="fixed inset-0 z-50 bg-white px-5 py-6"
// 						>
// 							<button
// 								className="absolute right-5 top-5 text-slate-500"
// 								onClick={() => setMobileOpen(false)}
// 							>
// 								<X size={20} />
// 							</button>
// 							<SidebarContent animate={false} />
// 						</motion.div>
// 					)}
// 				</AnimatePresence>
// 			</div>
// 		</>
// 	);
// }


"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, CalendarDays, PhoneCall, Menu, X, LogOut, TrendingUp, Users } from "lucide-react";
import { Badge } from "./ui/badge";

const navItems = [
	{ label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
	{ label: "Schedule",  href: "/schedule",  icon: CalendarDays },
	{ label: "Patients",  href: "/view-all-patients", icon: Users },
	{ label: "Earnings",  href: "/earnings",  icon: TrendingUp },
];

const assistantItems = [
	{ label: "Calls & Logs", href: "/calls_and_logs", icon: PhoneCall, badge: "12" },
];

export default function Sidebar() {
	const pathname   = usePathname();
	const router     = useRouter();
	const activePath = pathname === "/" ? "/dashboard" : pathname;

	const [open,       setOpen]       = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	// ── Read user only on the client, after hydration ─────────────────────────
	const [user, setUser] = useState(null);

	useEffect(() => {
		try {
			const stored = localStorage.getItem("auvia_user");
			if (stored) setUser(JSON.parse(stored));
		} catch {
			// ignore
		}
	}, []);

	function handleLogout() {
		localStorage.removeItem("auvia_token");
		localStorage.removeItem("auvia_clinic_id");
		localStorage.removeItem("auvia_user");
		router.push("/");
	}

	// Render a blank placeholder until the client has hydrated
	const initials = user?.name
		? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
		: "";

	const SidebarContent = ({ animate: doAnimate = true }) => (
		<div className="flex flex-col h-full gap-5">
			{/* Logo */}
			<Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden py-1">
				<div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-linear-to-br from-emerald-600 to-green-600 text-sm font-bold text-white">
					A
				</div>
				{doAnimate ? (
					<motion.span
						animate={{ display: open ? "inline-block" : "none", opacity: open ? 1 : 0 }}
						className="text-base font-semibold text-slate-900 whitespace-pre"
					>
						Auvia
					</motion.span>
				) : (
					<span className="text-base font-semibold text-slate-900">Auvia</span>
				)}
			</Link>

			{/* Clinic Ops */}
			<div className="flex flex-col gap-1">
				{doAnimate && open && (
					<p className="px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
						Clinic Ops
					</p>
				)}
				{navItems.map((item) => {
					const Icon     = item.icon;
					const isActive = activePath === item.href;
					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-colors ${
								isActive
									? "bg-emerald-50 text-emerald-700"
									: "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
							}`}
						>
							<Icon size={18} className="shrink-0" />
							<motion.span
								animate={
									doAnimate
										? { display: open ? "inline-block" : "none", opacity: open ? 1 : 0 }
										: {}
								}
								className="whitespace-pre text-sm"
							>
								{item.label}
							</motion.span>
						</Link>
					);
				})}
			</div>

			{/* Virtual Assistant */}
			<div className="flex flex-col gap-1">
				{doAnimate && open && (
					<p className="px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
						Virtual Assistant
					</p>
				)}
				{assistantItems.map((item) => {
					const Icon     = item.icon;
					const isActive = activePath === item.href;
					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-colors ${
								isActive
									? "bg-emerald-50 text-emerald-700"
									: "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
							}`}
						>
							<Icon size={18} className="shrink-0" />
							<motion.span
								animate={
									doAnimate
										? { display: open ? "inline-block" : "none", opacity: open ? 1 : 0 }
										: {}
								}
								className="whitespace-pre text-sm flex-1"
							>
								{item.label}
							</motion.span>
							{item.badge && open && (
								<Badge variant="info" className="ml-auto shrink-0">
									{item.badge}
								</Badge>
							)}
						</Link>
					);
				})}
			</div>

			{/* Bottom: user + logout */}
			<div className="mt-auto flex flex-col gap-2 border-t border-slate-100 pt-4">
				<div className="flex items-center gap-2.5 overflow-hidden px-1">
					{/* Avatar — always renders the same shell; initials fill in after hydration */}
					<div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
						{initials}
					</div>
					{doAnimate ? (
						<motion.div
							animate={{ display: open ? "block" : "none", opacity: open ? 1 : 0 }}
							className="min-w-0"
						>
							<p className="text-sm font-semibold text-slate-800 truncate">
								{user?.name ?? ""}
							</p>
							<p className="text-xs text-slate-400">Front Desk Lead</p>
						</motion.div>
					) : (
						<div className="min-w-0">
							<p className="text-sm font-semibold text-slate-800 truncate">
								{user?.name ?? ""}
							</p>
							<p className="text-xs text-slate-400">Front Desk Lead</p>
						</div>
					)}
				</div>

				<button
					onClick={handleLogout}
					className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
				>
					<LogOut size={16} className="shrink-0" />
					{(!doAnimate || open) && <span className="whitespace-pre">Sign Out</span>}
				</button>
			</div>
		</div>
	);

	return (
		<>
			{/* Desktop: animated collapsible */}
			<motion.aside
				className="hidden lg:flex h-full flex-col border-r border-slate-100 bg-white px-3 py-5 overflow-hidden"
				animate={{ width: open ? 220 : 60 }}
				transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 28 }}
				onMouseEnter={() => setOpen(true)}
				onMouseLeave={() => setOpen(false)}
			>
				<SidebarContent animate />
			</motion.aside>

			{/* Mobile: hamburger + slide-in drawer */}
			<div className="lg:hidden">
				<div className="flex h-12 items-center justify-between border-b border-slate-100 bg-white px-4">
					<div className="flex items-center gap-2">
						<div className="grid h-7 w-7 place-items-center rounded-lg bg-linear-to-br from-emerald-600 to-green-600 text-xs font-bold text-white">
							A
						</div>
						<span className="text-sm font-semibold text-slate-900">Auvia</span>
					</div>
					<button onClick={() => setMobileOpen(true)} className="text-slate-600">
						<Menu size={20} />
					</button>
				</div>
				<AnimatePresence>
					{mobileOpen && (
						<motion.div
							initial={{ x: "-100%", opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: "-100%", opacity: 0 }}
							transition={{ duration: 0.25, ease: "easeInOut" }}
							className="fixed inset-0 z-50 bg-white px-5 py-6"
						>
							<button
								className="absolute right-5 top-5 text-slate-500"
								onClick={() => setMobileOpen(false)}
							>
								<X size={20} />
							</button>
							<SidebarContent animate={false} />
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</>
	);
}