"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
	FiCalendar,
	FiChevronDown,
	FiDownload,
	FiFilter,
	FiPhoneCall,
	FiPlay,
	FiSearch,
	FiArrowUpRight,
	FiArrowDownLeft,
} from "react-icons/fi";

const calls = [
	{
		time: "10:45 AM",
		direction: "Incoming",
		caller: "Anusha Rao",
		phone: "+91 94880 12345",
		agent: "Virtual Agent",
		duration: "2m 14s",
		summary: "Rescheduled follow-up to Thursday 3 PM due to conflict.",
		action: "Schedule Updated",
		status: "appt_confirmed",
		recording: true,
	},
	{
		time: "10:32 AM",
		direction: "Outgoing",
		caller: "Srinivas Reddy",
		phone: "+91 98990 54321",
		agent: "Receptionist (LP)",
		duration: "4m 02s",
		summary: "Called to confirm insurance details for surgery tomorrow.",
		action: "Admin Follow-up",
		status: "admin",
		recording: true,
	},
	{
		time: "10:15 AM",
		direction: "Missed",
		caller: "Unknown Caller",
		phone: "+91 90000 88990",
		agent: "None",
		duration: "0s",
		summary: "",
		action: "Return Call",
		status: "missed",
		recording: false,
	},
	{
		time: "09:12 AM",
		direction: "Incoming",
		caller: "Priya Kavuri",
		phone: "+91 88888 22110",
		agent: "Virtual Agent",
		duration: "3m 22s",
		summary: "New patient booking. Collected insurance info and DOB.",
		action: "New Patient Registered",
		status: "new_patient",
		recording: true,
	},
];

export default function CallsAndLogsPage() {
	const [activeMonitoring, setActiveMonitoring] = useState(true);

	return (
		<div className="min-h-screen bg-[#f5f8fb] text-slate-900">
			<div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
				<Sidebar />
				<main className="flex flex-col gap-6 px-8 py-6">
					<Navbar
						activeMonitoring={activeMonitoring}
						onToggleMonitoring={setActiveMonitoring}
					/>

					<div className="flex flex-wrap items-center justify-between gap-4">
						<div>
							<h1 className="text-xl font-semibold">Calls & Logs</h1>
							<p className="text-sm text-slate-500">
								Review communication history and AI activity logs.
							</p>
						</div>
						<div className="flex items-center gap-3">
							<Button
								variant="outline"
								className="rounded-full px-4 transition-transform duration-200 hover:-translate-y-0.5"
							>
								<FiDownload className="mr-2" /> Export CSV
							</Button>
							<Button className="rounded-full px-4 transition-transform duration-200 hover:-translate-y-0.5">
								+ Log Manual Call
							</Button>
						</div>
					</div>

					<Card className="border-slate-100 shadow-sm">
						<CardContent className="space-y-4">
							<div className="flex flex-wrap items-center gap-3">
								<div className="relative flex w-full max-w-xs items-center">
									<FiSearch className="absolute left-3 text-slate-400" />
									<Input
										className="h-9 rounded-full border-slate-200 pl-9 text-sm"
										placeholder="Search logs, patients, or agents..."
									/>
								</div>
								<Button variant="outline" className="rounded-full text-xs">
									<FiCalendar className="mr-2" /> Today: Oct 24, 2026
									<FiChevronDown className="ml-2" />
								</Button>
								<Button variant="outline" className="rounded-full text-xs">
									Agent: All <FiChevronDown className="ml-2" />
								</Button>
								<Button variant="outline" className="rounded-full text-xs">
									Outcome: All <FiChevronDown className="ml-2" />
								</Button>
								<Button variant="outline" className="rounded-full text-xs">
									Call Type: All <FiChevronDown className="ml-2" />
								</Button>
								<Button variant="ghost" className="rounded-full text-xs">
									<FiFilter className="mr-2" /> Clear Filters
								</Button>
							</div>
						</CardContent>
					</Card>

					<div className="grid gap-6 lg:grid-cols-[2.2fr_1fr]">
						<Card className="border-slate-100 shadow-sm">
							<CardHeader>
								<div className="grid grid-cols-[90px_1.2fr_1fr_1fr_1.5fr_120px] text-[11px] uppercase tracking-[0.2em] text-slate-400">
									<span>Time & Type</span>
									<span>Caller</span>
									<span>Agent</span>
									<span>Duration</span>
									<span>AI Summary & Action</span>
									<span>Recording</span>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								{calls.map((call) => (
									<div
										key={`${call.time}-${call.caller}`}
										className={`grid grid-cols-[90px_1.2fr_1fr_1fr_1.5fr_120px] items-center gap-3 rounded-2xl border border-slate-100 px-4 py-3 text-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow ${
											call.direction === "Incoming"
												? "border-l-2 border-l-[var(--brand-primary)]"
												: call.direction === "Outgoing"
													? "border-l-2 border-l-slate-300"
													: "border-l-2 border-l-amber-400"
										}`}
									>
										<div className="text-xs font-semibold">
											{call.time.split(" ")[0]}
											<span className="block text-[10px] text-slate-400">
												{call.time.split(" ")[1]}
											</span>
											<div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
												{call.direction === "Incoming" ? (
													<FiArrowDownLeft className="text-emerald-500" />
												) : call.direction === "Outgoing" ? (
													<FiArrowUpRight className="text-slate-500" />
												) : (
													<FiPhoneCall className="text-amber-500" />
												)}
												{call.direction}
											</div>
										</div>
										<div>
											<p className="font-semibold text-slate-800">{call.caller}</p>
											<p className="text-xs text-slate-400">{call.phone}</p>
										</div>
										<div>
											<Badge variant="info" className="text-[9px]">
												{call.agent}
											</Badge>
										</div>
										<div className="text-xs text-slate-500">{call.duration}</div>
										<div>
											{call.summary ? (
												<p className="text-xs text-slate-500">“{call.summary}”</p>
											) : (
												<p className="text-xs text-slate-400">No summary</p>
											)}
											<Badge
												variant={
													call.status === "missed"
														? "warning"
														: call.status === "new_patient"
														? "success"
														: "info"
												}
												className="mt-2 text-[9px]"
											>
												{call.action}
											</Badge>
										</div>
										<div className="flex items-center justify-end">
											{call.recording ? (
												<Button variant="outline" size="sm" className="h-8 w-8 rounded-full p-0">
													<FiPlay className="text-slate-600" />
												</Button>
											) : (
												<Button variant="outline" size="sm" className="h-8 rounded-full px-3 text-xs">
													Return Call
												</Button>
											)}
										</div>
									</div>
								))}
								<div className="flex items-center justify-between pt-2 text-xs text-slate-500">
									<span>Showing 1-12 of 128 results</span>
									<div className="flex items-center gap-2">
										<Button variant="outline" size="sm" className="rounded-full px-3">
											Previous
										</Button>
										<Button variant="outline" size="sm" className="rounded-full px-3">
											Next
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>

						<div className="flex flex-col gap-6">
							<Card className="border-slate-100 shadow-sm">
								<CardHeader className="flex flex-row items-center justify-between">
									<CardTitle>Total Today</CardTitle>
									<Badge variant="success">98.5% Success</Badge>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-semibold">128</div>
									<p className="text-xs text-slate-500">Calls Handled</p>
								</CardContent>
							</Card>

							<Card className="border-slate-100 shadow-sm">
								<CardHeader>
									<CardTitle>Daily Handling Efficiency</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div>
											<div className="flex items-center justify-between text-xs text-slate-500">
												<span>Virtual Agent Workload</span>
												<span>84% (107 Calls)</span>
											</div>
											<div className="mt-2 h-2 rounded-full bg-slate-100">
												<div className="h-2 w-[84%] rounded-full bg-(--brand-primary)" />
											</div>
										</div>
										<div>
											<div className="flex items-center justify-between text-xs text-slate-500">
												<span>Human Staff Intervention</span>
												<span>16% (21 Calls)</span>
											</div>
											<div className="mt-2 h-2 rounded-full bg-slate-100">
												<div className="h-2 w-[16%] rounded-full bg-slate-900" />
											</div>
										</div>
									</div>
									<p className="mt-4 text-xs text-slate-500">
										The Virtual Agent automated approximately <strong>4.2 hours</strong>
										of manual call time today, allowing front desk staff to focus on
										high-priority patient care.
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
