import { motion } from "motion/react";
import { Linkedin, Twitter, Instagram, Youtube } from "lucide-react";

export function FooterNew() {
  return (
    <footer className="bg-gradient-to-br from-purple-800 via-purple-700 to-violet-800 px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Brand Column */}
          <div>
            <div className="mb-6 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-white">
                <span className="text-base font-bold text-purple-700">A</span>
              </div>
              <span className="text-xl font-bold">auviacare</span>
            </div>
            <p className="mb-6 leading-relaxed text-purple-100">
              We are a full-spectrum technology solution that solves across various aspects of both patients' and
              doctors' needs and their interactions to significantly improve health positives.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-6 text-lg font-bold">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-purple-100 transition-colors hover:text-white">
                  → Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-purple-100 transition-colors hover:text-white">
                  → About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-purple-100 transition-colors hover:text-white">
                  → Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-purple-100 transition-colors hover:text-white">
                  → Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-purple-100 transition-colors hover:text-white">
                  → News Room
                </a>
              </li>
            </ul>
          </div>

          {/* Offices */}
          <div>
            <h3 className="mb-6 text-lg font-bold">Offices</h3>
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 font-medium">Bangalore</h4>
                <p className="text-sm leading-relaxed text-purple-100">
                  Digicare Health Solutions Pvt. Ltd.,
                  <br />
                  Incubex HSR27, 1500, 19th Main Rd,
                  <br />
                  1st Sector, HSR Layout, Bangalore,
                  <br />
                  Karnataka - 560102
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-medium">Ahmedabad</h4>
                <p className="text-sm leading-relaxed text-purple-100">
                  Digicare Health Solutions Pvt. Ltd.,
                  <br />
                  4th Floor, Plot No. 115/5, TP Scheme
                  <br />
                  No. 51, off Ambli-Bopal Road,
                  <br />
                  Ahmedabad, Gujarat - 380058
                </p>
              </div>
            </div>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="mb-6 text-lg font-bold">Contact Us</h3>
            <div className="mb-6 space-y-3">
              <p className="text-purple-100">
                📞 <a href="tel:+919974042363" className="hover:text-white">+91 99740 42363</a>
              </p>
              <p className="text-sm text-purple-100">Monday - Saturday | 9am to 6pm</p>
              <p className="text-purple-100">
                ✉️ <a href="mailto:support@auviacare.in" className="hover:text-white">support@auviacare.in</a>
              </p>
            </div>

            {/* Follow Us */}
            <div>
              <h4 className="mb-4 font-medium">Follow Us</h4>
              <div className="flex gap-3">
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href="#"
                  className="flex size-10 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20"
                >
                  <Linkedin className="size-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href="#"
                  className="flex size-10 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20"
                >
                  <Twitter className="size-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href="#"
                  className="flex size-10 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20"
                >
                  <Instagram className="size-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href="#"
                  className="flex size-10 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20"
                >
                  <Youtube className="size-5" />
                </motion.a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-purple-600 pt-8 text-center">
          <p className="text-sm text-purple-200">© 2026 AuviaCare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
