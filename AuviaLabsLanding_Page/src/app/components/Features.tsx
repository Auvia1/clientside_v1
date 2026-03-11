import { motion } from "motion/react";
import { Phone, Calendar, Route, BarChart3, PhoneCall, MessageSquare } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Phone,
      title: "AI Voice Receptionist",
      description: "Handles patient calls 24/7 with natural AI conversations.",
    },
    {
      icon: Calendar,
      title: "Automated Appointment Booking",
      description: "Schedules and manages appointments automatically.",
    },
    {
      icon: Route,
      title: "Smart Call Routing",
      description: "Routes patients to correct departments instantly.",
    },
    {
      icon: BarChart3,
      title: "Clinic Analytics",
      description: "Tracks calls and appointment revenue in real-time.",
    },
    {
      icon: PhoneCall,
      title: "Missed Call Recovery",
      description: "Automatically calls patients back to prevent lost revenue.",
    },
    {
      icon: MessageSquare,
      title: "Patient WhatsApp Notifications",
      description: "Automated appointment reminders via WhatsApp.",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-white to-slate-50 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">
            Everything you need to automate your clinic
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Powerful AI features that transform how your clinic handles patient communications.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-emerald-200 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 p-3 transition-transform group-hover:scale-110">
                <feature.icon className="size-6 text-emerald-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">{feature.title}</h3>
              <p className="leading-relaxed text-slate-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
