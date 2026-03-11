import { motion } from "motion/react";

export function CTASection() {
  return (
    <section className="bg-gradient-to-br from-purple-200 via-purple-100 to-blue-100 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-12">
          {/* Left - Character Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Decorative element */}
              <div className="absolute -left-8 top-0 h-24 w-24 rounded-2xl border-2 border-purple-300 opacity-30"></div>

              {/* Character */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [-3, 3, -3],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 flex flex-col items-center"
              >
                {/* Head */}
                <div className="size-40 rounded-3xl bg-gradient-to-br from-yellow-300 to-yellow-400 shadow-2xl">
                  <div className="flex size-full items-center justify-center text-6xl">😊</div>
                </div>
                {/* Body */}
                <div className="mt-4 h-32 w-40 rounded-3xl bg-gradient-to-b from-purple-300 to-purple-400 shadow-lg"></div>
                {/* Arm */}
                <div className="absolute right-0 top-32 h-24 w-16 rotate-45 rounded-2xl bg-yellow-300 shadow"></div>
              </motion.div>
            </div>
          </motion.div>

          {/* Center - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 text-center lg:text-left"
          >
            <h2 className="mb-6 text-3xl font-bold text-slate-800 md:text-4xl">Make a Difference</h2>
            <p className="mb-2 text-lg text-slate-700">We are committed to making a long-lasting</p>
            <p className="text-lg text-slate-700">positive change to the world of Healthcare Management.</p>
          </motion.div>

          {/* Right - Button */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden md:block"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-2xl bg-white px-8 py-4 font-medium text-slate-800 shadow-lg transition-shadow hover:shadow-xl"
            >
              Join the Team
            </motion.button>
          </motion.div>

          {/* Mobile button */}
          <div className="mt-6 md:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full rounded-2xl bg-white px-8 py-4 font-medium text-slate-800 shadow-lg"
            >
              Join the Team
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
