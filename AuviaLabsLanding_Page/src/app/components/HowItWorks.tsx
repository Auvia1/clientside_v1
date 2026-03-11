import { motion } from "motion/react";
import { Phone, Brain, CheckCircle } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: Phone,
      title: "Patient calls clinic",
      description: "A patient calls your clinic number at any time of day.",
    },
    {
      icon: Brain,
      title: "AI receptionist answers",
      description: "Our AI voice agent answers instantly and understands the patient's request using natural language.",
    },
    {
      icon: CheckCircle,
      title: "Appointment booked automatically",
      description: "The appointment is scheduled in your system and the patient receives confirmation via SMS/WhatsApp.",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">How It Works</h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Transform your clinic operations in three simple steps
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-emerald-200 via-green-200 to-emerald-200 lg:block"></div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className={`flex flex-col items-center gap-8 lg:flex-row ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Content */}
                <div className="flex-1 lg:text-right" style={index % 2 === 1 ? { textAlign: "left" } : {}}>
                  <div className="inline-block rounded-full bg-emerald-100 px-4 py-1 text-sm font-bold text-emerald-700">
                    Step {index + 1}
                  </div>
                  <h3 className="mb-3 mt-4 text-2xl font-bold text-slate-900">{step.title}</h3>
                  <p className="text-lg leading-relaxed text-slate-600">{step.description}</p>
                </div>

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="relative z-10 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg"
                >
                  <step.icon className="size-10 text-white" />
                </motion.div>

                {/* Spacer for alignment */}
                <div className="hidden flex-1 lg:block"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
