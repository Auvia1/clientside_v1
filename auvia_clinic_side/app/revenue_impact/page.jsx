"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Card, CardContent, CardTitle } from "../components/ui/card";

export default function RevenueImpactPage() {
	const [activeMonitoring, setActiveMonitoring] = useState(true);

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900">
			<div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
				<Sidebar />
				<main className="flex flex-col gap-6 px-8 py-6">
					<Navbar
						activeMonitoring={activeMonitoring}
						onToggleMonitoring={setActiveMonitoring}
					/>
					<div>
						<h1 className="text-xl font-semibold">Revenue Impact</h1>
						<p className="text-sm text-slate-500">
							Track financial impact of the virtual agent
						</p>
					</div>
					<Card>
						<CardContent>
							<CardTitle>Agent ROI</CardTitle>
							<p className="mt-3 text-sm text-slate-500">
								Connect this view to revenue analytics.
							</p>
						</CardContent>
					</Card>
				</main>
			</div>
		</div>
	);
}
