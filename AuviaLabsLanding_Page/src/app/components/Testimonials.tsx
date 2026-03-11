import { motion } from "motion/react";
import { Quote } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      quote: "Since using Auvia Labs, our clinic never misses patient calls. The AI receptionist handles everything seamlessly.",
      author: "Dr. Priya Sharma",
      role: "Senior Physician",
      clinic: "CarePlus Clinics",
    },
    {
      quote: "We've seen a 60% increase in appointment bookings. The automation has transformed how we operate our practice.",
      author: "Dr. Rajesh Kumar",
      role: "Chief Medical Officer",
      clinic: "Medico Health",
    },
    {
      quote: "The best investment we've made for our clinic. Our staff can now focus on patient care instead of answering phones.",
      author: "Dr. Sarah Johnson",
      role: "Clinic Director",
      clinic: "CityCare Medical",
    },
  ];

  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">Loved by healthcare professionals</h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            See what doctors and clinic administrators say about Auvia Labs
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm transition-all hover:shadow-lg"
            >
              <Quote className="mb-4 size-8 text-emerald-500" />
              <p className="mb-6 text-lg leading-relaxed text-slate-700">{testimonial.quote}</p>
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-400"></div>
                <div>
                  <p className="font-bold text-slate-900">{testimonial.author}</p>
                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                  <p className="text-sm text-emerald-600">{testimonial.clinic}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
