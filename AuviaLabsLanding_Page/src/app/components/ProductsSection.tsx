import { motion } from "motion/react";

export function ProductsSection() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-white px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Section Label */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 text-center text-sm font-medium uppercase tracking-wider text-slate-400"
        >
          AUVIACARE PRODUCTS
        </motion.p>

        {/* Main Heading and Description */}
        <div className="mb-16 grid gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-6 text-3xl font-bold text-slate-800 md:text-4xl lg:text-5xl">
              We enable doctors by digitizing their practice journey and provide patients with personalized care
              programs.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center"
          >
            <p className="text-lg leading-relaxed text-slate-600">
              We facilitate a positive health journey and improve patient's outcomes, by improving the quality of care
              on one end and enhancing the quality of life on the other.
            </p>
          </motion.div>
        </div>

        {/* Product Cards */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* For Individuals Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5 }}
            className="rounded-3xl bg-white p-8 shadow-lg transition-shadow hover:shadow-xl"
          >
            <div className="mb-6">
              <p className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-500">FOR INDIVIDUALS</p>
              <p className="text-xs uppercase tracking-wide text-slate-400">CHRONIC CARE MANAGEMENT</p>
            </div>

            {/* GoodFlip Logo */}
            <div className="mb-8">
              <h3 className="flex items-center gap-2 text-3xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
                  ✕ GoodFlip
                </span>
              </h3>
            </div>

            {/* Content with illustration */}
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <p className="mb-4 text-slate-600">
                  Your very own care companion that helps you to take control of your health, one step at a time.
                </p>
              </div>

              {/* Character illustration */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center"
              >
                <div className="size-20 rounded-full bg-gradient-to-br from-pink-300 to-pink-400 shadow-lg"></div>
                <div className="mt-2 h-16 w-16 rounded-2xl bg-gradient-to-b from-purple-300 to-purple-400"></div>
              </motion.div>
            </div>
          </motion.div>

          {/* For Healthcare Professionals Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="rounded-3xl bg-white p-8 shadow-lg transition-shadow hover:shadow-xl"
          >
            <div className="mb-6">
              <p className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-500">
                FOR HEALTHCARE PROFESSIONALS
              </p>
              <p className="text-xs uppercase tracking-wide text-slate-400">PATIENT CARE AND PRACTICE MANAGEMENT</p>
            </div>

            {/* AlvaPractice Logo */}
            <div className="mb-8">
              <h3 className="flex items-center gap-2 text-3xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-violet-600">
                  ✕ alvaPractice
                </span>
              </h3>
            </div>

            {/* Content with illustration */}
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <p className="mb-4 text-slate-600">
                  All-in-one platform that smartly manages your practice, allowing you to deliver exceptional patient
                  care effortlessly.
                </p>
                <p className="text-slate-600">Digitize your practice and free up valuable time.</p>
              </div>

              {/* Character illustration */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center"
              >
                <div className="size-20 rounded-full bg-gradient-to-br from-amber-300 to-amber-400 shadow-lg"></div>
                <div className="mt-2 h-16 w-16 rounded-2xl bg-white shadow-md"></div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
