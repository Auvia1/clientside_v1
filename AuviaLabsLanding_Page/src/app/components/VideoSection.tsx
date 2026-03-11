import { motion } from "motion/react";

export function VideoSection() {
  return (
    <section className="bg-gradient-to-br from-purple-700 via-purple-600 to-violet-600 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-6 text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
              At AuviaCare, we believe in a holistic approach that improves the quality of life for both individuals
              and healthcare professionals.
            </h2>
          </motion.div>

          {/* Right Video */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="w-full overflow-hidden rounded-2xl shadow-2xl">
              <div className="relative aspect-video bg-slate-900">
                {/* YouTube embed placeholder */}
                <div className="flex size-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                  <div className="text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="flex size-20 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                        <div className="size-0 border-y-8 border-l-12 border-r-0 border-y-transparent border-l-white"></div>
                      </div>
                    </div>
                    <p className="text-sm text-white/70">AuviaCare - Healthcare ecosystem at your fingertips</p>
                  </div>
                </div>
                {/* You can replace with actual iframe */}
                {/* <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                  title="AuviaCare Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe> */}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
