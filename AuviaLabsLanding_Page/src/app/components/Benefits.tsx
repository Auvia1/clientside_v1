import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";

export function Benefits() {
  const benefits = [
    "Reduce missed calls by 95%",
    "Increase appointment bookings by 60%",
    "Automate clinic workflows completely",
    "Improve patient experience dramatically",
  ];

  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-6 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              Increase Clinic Efficiency with AI
            </h2>
            <p className="mb-8 text-lg text-slate-600">
              Transform your clinic operations and deliver exceptional patient care with AI-powered automation.
            </p>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="mt-1 rounded-full bg-emerald-100 p-1">
                    <CheckCircle2 className="size-5 text-emerald-600" />
                  </div>
                  <span className="text-lg text-slate-700">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              {/* Main illustration card */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 p-8 shadow-xl">
                <div className="space-y-6">
                  {/* AI Call Animation */}
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex size-16 items-center justify-center rounded-full bg-emerald-500 shadow-lg"
                    >
                      <svg
                        className="size-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </motion.div>
                    <div className="flex-1">
                      <div className="mb-2 h-3 w-full rounded-full bg-slate-200"></div>
                      <div className="h-3 w-3/4 rounded-full bg-slate-200"></div>
                    </div>
                  </div>

                  {/* Automation Steps */}
                  <div className="space-y-3">
                    {[1, 2, 3].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.3, repeat: Infinity, repeatDelay: 2 }}
                        className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm"
                      >
                        <div className="size-10 rounded-full bg-green-100"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-2 rounded-full bg-slate-200"></div>
                          <div className="h-2 w-2/3 rounded-full bg-slate-200"></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating stats */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -right-4 -top-4 rounded-xl border border-emerald-200 bg-white p-4 shadow-lg"
              >
                <p className="text-sm font-medium text-slate-600">Efficiency Boost</p>
                <p className="text-3xl font-bold text-emerald-600">+95%</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 rounded-xl border border-green-200 bg-white p-4 shadow-lg"
              >
                <p className="text-sm font-medium text-slate-600">Time Saved</p>
                <p className="text-3xl font-bold text-green-600">40hrs/week</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
