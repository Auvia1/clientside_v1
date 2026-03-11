import { motion } from "motion/react";

export function CoreValues() {
  const values = [
    {
      icon: "🖐️",
      title: "Digital Intervention",
      description: "Leveraging technology to provide seamless healthcare solutions and improve patient outcomes.",
    },
    {
      icon: "👨‍⚕️",
      title: "Doctors at the core",
      description:
        "Empowering healthcare professionals with tools that enhance their practice and patient relationships.",
    },
    {
      icon: "🏥",
      title: "Patients First",
      description: "Prioritizing patient care and experience in every decision we make and solution we build.",
    },
  ];

  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-3">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="mx-auto mb-6 flex size-32 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-blue-100 shadow-lg"
              >
                <span className="text-6xl">{value.icon}</span>
              </motion.div>

              {/* Title */}
              <h3 className="mb-4 text-2xl font-bold text-slate-800">{value.title}</h3>

              {/* Description */}
              <p className="leading-relaxed text-slate-600">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
