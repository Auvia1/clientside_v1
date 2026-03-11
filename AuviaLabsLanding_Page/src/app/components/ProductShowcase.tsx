import { motion } from "motion/react";

export function ProductShowcase() {
  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-7xl space-y-24">
        {/* Admin Portal */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1 text-sm font-medium text-emerald-700">
              For Administrators
            </div>
            <h2 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">Auvia Admin Portal</h2>
            <p className="mb-6 text-lg leading-relaxed text-slate-600">
              Admin dashboard for managing multiple clinics, phone numbers, and analytics. Get a bird's eye view of
              all your healthcare facilities in one place.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-emerald-100 p-1">
                  <svg className="size-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700">Multi-clinic management from single dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-emerald-100 p-1">
                  <svg className="size-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700">Real-time analytics and reporting</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-emerald-100 p-1">
                  <svg className="size-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700">Phone number and AI agent configuration</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 shadow-xl">
              <div className="mb-6 flex items-center gap-2">
                <div className="size-3 rounded-full bg-red-400"></div>
                <div className="size-3 rounded-full bg-yellow-400"></div>
                <div className="size-3 rounded-full bg-green-400"></div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
                  <span className="font-medium text-slate-700">Total Clinics</span>
                  <span className="text-2xl font-bold text-emerald-600">24</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-emerald-50 p-4">
                    <p className="text-sm text-slate-600">Active Calls</p>
                    <p className="text-3xl font-bold text-slate-900">142</p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4">
                    <p className="text-sm text-slate-600">Today's Bookings</p>
                    <p className="text-3xl font-bold text-slate-900">89</p>
                  </div>
                </div>
                <div className="h-32 rounded-lg bg-gradient-to-r from-emerald-100 to-green-100 p-4">
                  <p className="mb-2 text-xs font-medium text-slate-600">Revenue Analytics</p>
                  <div className="flex items-end gap-1">
                    {[40, 70, 45, 80, 60, 95, 75, 85].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-emerald-500"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Clinic Portal */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 shadow-xl">
              <div className="mb-6 flex items-center gap-2">
                <div className="size-3 rounded-full bg-red-400"></div>
                <div className="size-3 rounded-full bg-yellow-400"></div>
                <div className="size-3 rounded-full bg-green-400"></div>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <p className="mb-3 text-sm font-medium text-slate-600">Upcoming Appointments</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <div className="size-10 rounded-full bg-emerald-200"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">Sarah Johnson</p>
                        <p className="text-xs text-slate-500">10:30 AM - Checkup</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <div className="size-10 rounded-full bg-blue-200"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">Mike Chen</p>
                        <p className="text-xs text-slate-500">11:00 AM - Consultation</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-green-50 p-4">
                    <p className="text-sm text-slate-600">Today</p>
                    <p className="text-2xl font-bold text-slate-900">12</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-4">
                    <p className="text-sm text-slate-600">This Week</p>
                    <p className="text-2xl font-bold text-slate-900">67</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <div className="mb-4 inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-700">
              For Clinic Staff
            </div>
            <h2 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">Auvia Clinic Portal</h2>
            <p className="mb-6 text-lg leading-relaxed text-slate-600">
              Staff portal for managing appointments, patients, and call logs. Everything your clinic needs in one
              intuitive interface.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-green-100 p-1">
                  <svg className="size-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700">Complete patient management system</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-green-100 p-1">
                  <svg className="size-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700">Appointment scheduling and calendar view</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-green-100 p-1">
                  <svg className="size-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700">Call logs and patient interaction history</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
