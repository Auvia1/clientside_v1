import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function HeroNew() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-slate-50 px-6 pb-20 pt-32 md:pt-40">
      {/* Decorative squares */}
      <div className="absolute left-10 top-32 size-12 rounded-lg border-2 border-purple-200 opacity-30"></div>
      <div className="absolute left-12 bottom-32 size-16 rounded-lg border-2 border-blue-200 opacity-20"></div>

      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="mb-6 text-4xl font-bold text-slate-800 md:text-5xl lg:text-6xl">
              Let's make every day better!
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-slate-600">
              AuviaCare is a digital system that empowers both healthcare professionals and individuals with chronic
              conditions to create healthy habits leading to positive health outcomes.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 px-8 py-4 font-medium text-white shadow-lg transition-shadow hover:shadow-xl"
              >
                For Individuals
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 px-8 py-4 font-medium text-white shadow-lg transition-shadow hover:shadow-xl"
              >
                For Healthcare Professionals
              </motion.button>
            </div>
          </motion.div>

          {/* Right Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <div className="relative">
              {/* Mock illustration - you can replace with actual image */}
              <div className="relative flex items-center justify-center">
                {/* Character and phone illustration placeholder */}
                <div className="flex items-center gap-8">
                  {/* Left character */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="flex flex-col items-center"
                  >
                    <div className="size-24 rounded-full bg-gradient-to-br from-orange-300 to-orange-400"></div>
                    <div className="mt-2 h-32 w-24 rounded-3xl bg-gradient-to-b from-purple-300 to-purple-400"></div>
                    <div className="mt-2 flex gap-2">
                      <div className="h-16 w-10 rounded-2xl bg-purple-400"></div>
                      <div className="h-16 w-10 rounded-2xl bg-purple-400"></div>
                    </div>
                  </motion.div>

                  {/* Phone mockup */}
                  <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10 rounded-3xl border-8 border-slate-700 bg-white p-4 shadow-2xl"
                  >
                    <div className="mb-2 h-6 w-32 rounded-full bg-slate-700"></div>
                    <div className="h-96 w-56 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 p-4">
                      <div className="mb-4 text-center text-sm font-bold text-slate-700">Medication Tracker</div>
                      <div className="space-y-3">
                        <div className="h-16 rounded-xl bg-white shadow"></div>
                        <div className="h-16 rounded-xl bg-white shadow"></div>
                        <div className="h-16 rounded-xl bg-white shadow"></div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Right character */}
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    className="flex flex-col items-center"
                  >
                    <div className="size-24 rounded-full bg-gradient-to-br from-amber-300 to-amber-400"></div>
                    <div className="mt-2 h-32 w-24 rounded-3xl bg-white shadow-lg"></div>
                    <div className="mt-2 flex gap-2">
                      <div className="h-16 w-10 rounded-2xl bg-purple-300"></div>
                      <div className="h-16 w-10 rounded-2xl bg-yellow-300"></div>
                    </div>
                  </motion.div>
                </div>

                {/* Floating emoji/character */}
                <motion.div
                  animate={{ 
                    y: [0, -20, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-12 right-0 size-32 rounded-3xl bg-gradient-to-br from-yellow-300 to-yellow-400 shadow-xl"
                >
                  <div className="flex size-full items-center justify-center text-4xl">😊</div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
