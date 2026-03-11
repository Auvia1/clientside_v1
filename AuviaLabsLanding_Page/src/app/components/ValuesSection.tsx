import { motion } from "motion/react";
import { Check } from "lucide-react";

export function ValuesSection() {
  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Top Section */}
        <div className="mb-20 grid items-center gap-12 lg:grid-cols-2">
          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -left-8 top-12 h-16 w-16 rounded-lg border-2 border-slate-200"></div>
              <div className="absolute -right-4 top-8 h-12 w-12 rounded-lg bg-slate-100"></div>
              
              {/* Character */}
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [-2, 2, -2]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <div className="flex flex-col items-center">
                  {/* Head */}
                  <div className="size-32 rounded-3xl bg-gradient-to-br from-yellow-300 to-yellow-400 shadow-xl">
                    <div className="flex size-full items-center justify-center text-5xl">😊</div>
                  </div>
                  {/* Body */}
                  <div className="mt-3 h-24 w-32 rounded-3xl bg-gradient-to-b from-purple-300 to-purple-400 shadow-lg"></div>
                  {/* Arms */}
                  <div className="relative -mt-16 flex w-48 justify-between">
                    <div className="h-20 w-12 rounded-2xl bg-yellow-300 shadow"></div>
                    <div className="h-20 w-12 rounded-2xl bg-yellow-300 shadow"></div>
                  </div>
                </div>
              </motion.div>

              {/* Decorative icons */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 right-4 text-3xl"
              >
                🦋
              </motion.div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-6 text-4xl font-bold text-slate-800 md:text-5xl">We're here for you.</h2>
            <p className="mb-6 text-lg leading-relaxed text-slate-600">
              Everyone across the board, both healthcare providers and recipients, deserve to lead a life filled with
              safe action, clarity and control.
            </p>
            <p className="text-lg leading-relaxed text-slate-600">
              This is our fundamental belief, our motivation and our mission.
            </p>
          </motion.div>
        </div>

        {/* Two Cards Section */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* For Individuals Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-3xl bg-gradient-to-br from-purple-200 via-purple-100 to-blue-100 shadow-lg"
          >
            <div className="p-8">
              <h3 className="mb-4 text-2xl font-bold text-slate-800">For Individuals</h3>
              <p className="mb-8 leading-relaxed text-slate-700">
                You deserve the best possible quality of care and support. We are together with you on this journey.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Check className="size-5 text-purple-600" />
                  </div>
                  <span className="text-slate-700">Intelligent App for lifestyle modifications</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Check className="size-5 text-purple-600" />
                  </div>
                  <span className="text-slate-700">Outcome based Personalised Care Programs</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Check className="size-5 text-purple-600" />
                  </div>
                  <span className="text-slate-700">Continuous support from Care Team</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Check className="size-5 text-purple-600" />
                  </div>
                  <span className="text-slate-700">Health records at your fingertips</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* For Healthcare Professionals Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="overflow-hidden rounded-3xl bg-gradient-to-br from-purple-200 via-purple-100 to-blue-100 shadow-lg"
          >
            <div className="p-8">
              <h3 className="mb-4 text-2xl font-bold text-slate-800">For Healthcare Professionals</h3>
              <p className="mb-8 leading-relaxed text-slate-700">
                Minimise administrative workload and focus on what's really important: patient care and the growth of
                your practice.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Check className="size-5 text-purple-600" />
                  </div>
                  <span className="text-slate-700">ABDM Certified</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Check className="size-5 text-purple-600" />
                  </div>
                  <span className="text-slate-700">Highest level of Data Security</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Check className="size-5 text-purple-600" />
                  </div>
                  <span className="text-slate-700">Track patient outcomes</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Check className="size-5 text-purple-600" />
                  </div>
                  <span className="text-slate-700">Seamless clinic management</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
