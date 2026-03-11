import { motion } from "motion/react";

export function TrustedBy() {
  const logos = [
    "Apollo Hospitals",
    "CarePlus Clinics",
    "Medico Health",
    "CityCare",
    "HealthFirst",
    "MediCare Plus",
  ];

  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-slate-400"
        >
          Trusted by leading healthcare providers
        </motion.p>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {logos.map((logo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-center"
            >
              <div className="text-center text-sm font-semibold text-slate-400 grayscale transition-all hover:text-slate-600 hover:grayscale-0">
                {logo}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
