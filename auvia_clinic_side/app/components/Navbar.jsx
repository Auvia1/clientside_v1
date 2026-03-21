

// "use client";

// import { useState, useRef, useEffect } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { Search, Bell, Moon, User, LogOut, Settings } from "lucide-react";
// import { Input } from "./ui/input";
// import { Switch } from "./ui/switch";
// import { Button } from "./ui/button";

// export default function Navbar({ activeMonitoring, onToggleMonitoring }) {
//   const router = useRouter();
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   // Close dropdown on outside click
//   useEffect(() => {
//     function handleClickOutside(e) {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setDropdownOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   function handleLogout() {
//     localStorage.removeItem("auvia_token");
//     localStorage.removeItem("auvia_clinic_id");
//     localStorage.removeItem("auvia_user");
//     router.push("/");
//   }

//   // Read display name from localStorage
//   const user = typeof window !== "undefined"
//     ? JSON.parse(localStorage.getItem("auvia_user") || "{}")
//     : {};

//   return (
//     <header className="flex items-center justify-between gap-6">
//       <div className="relative flex w-full max-w-xl items-center">
//         <Search className="absolute left-3 h-4 w-4 text-slate-400" />
//         <Input
//           className="h-10 rounded-full border-slate-200 bg-white pl-9 text-sm"
//           placeholder="Search patients or operations..."
//         />
//       </div>

//       <div className="flex items-center gap-3">
//         <div className="flex items-center gap-2 rounded-full border border-[#00A3AD] bg-white px-3 py-1 text-[11px] text-(--brand-secondary)">
//           <span className="font-semibold text-[#00A3AD]">Activate Agent</span>
//           <Switch
//             checked={activeMonitoring}
//             onCheckedChange={onToggleMonitoring}
//           />
//         </div>

//         <Button variant="outline" size="sm" className="h-9 w-9 rounded-full p-0">
//           <Bell className="h-4 w-4 text-slate-600" />
//         </Button>

//         <Button variant="outline" size="sm" className="h-9 w-9 rounded-full p-0">
//           <Moon className="h-4 w-4 text-slate-600" />
//         </Button>

//         {/* Profile dropdown */}
//         <div className="relative" ref={dropdownRef}>
//           <Button
//             variant="outline"
//             size="sm"
//             className="h-9 w-9 rounded-full p-0"
//             aria-label="Profile"
//             onClick={() => setDropdownOpen((o) => !o)}
//           >
//             <User className="h-4 w-4 text-slate-600" />
//           </Button>

//           {dropdownOpen && (
//             <div className="absolute right-0 top-11 z-50 w-52 rounded-2xl border border-slate-100 bg-white py-2 shadow-xl">
//               {/* User info */}
//               <div className="border-b border-slate-100 px-4 pb-2">
//                 <p className="text-sm font-semibold text-slate-800 truncate">
//                   {user.name || "Receptionist"}
//                 </p>
//                 <p className="text-xs text-slate-400 truncate">
//                   {user.clinic || ""}
//                 </p>
//               </div>

//               {/* Menu items */}
//               <Link
//                 href="/profile_section"
//                 onClick={() => setDropdownOpen(false)}
//                 className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
//               >
//                 <Settings className="h-4 w-4 text-slate-400" />
//                 Profile & Settings
//               </Link>

//               <button
//                 onClick={handleLogout}
//                 className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
//               >
//                 <LogOut className="h-4 w-4" />
//                 Log Out
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// }

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, Moon, User, LogOut, Settings, X } from "lucide-react";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  FiPhone,
  FiCalendar,
  FiUser,
  FiShield,
  FiBookOpen,
  FiMessageCircle,
  FiAlertCircle,
  FiLogOut,
} from "react-icons/fi";

// ─── Inline Profile Modal ───────────────────────────────────────────────────
function ProfileModal({ open, onClose }) {
  const router = useRouter();
  const [onDuty, setOnDuty] = useState(true);

  // Escape key to close
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function handleLogout() {
    localStorage.removeItem("auvia_token");
    localStorage.removeItem("auvia_clinic_id");
    localStorage.removeItem("auvia_user");
    router.push("/");
  }

  if (!open) return null;

  return (
    // Backdrop — click outside closes modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-[#f5f8fb] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-full border-slate-100 shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                Staff Profile
              </CardTitle>
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-full p-0"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Avatar + On Duty toggle */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-600">
                    LP
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Lakshmi Priya</p>
                  <p className="text-xs text-slate-400">Front Desk Lead</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>On Duty</span>
                <Switch checked={onDuty} onCheckedChange={setOnDuty} />
              </div>
            </div>

            {/* Daily Performance */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                My Daily Performance
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow">
                  <div className="flex items-center gap-2 text-slate-400">
                    <FiPhone />
                    <span className="text-[10px] uppercase">Calls Handled</span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-slate-800">42</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow">
                  <div className="flex items-center gap-2 text-slate-400">
                    <FiCalendar />
                    <span className="text-[10px] uppercase">Appts Booked</span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-slate-800">18</p>
                </div>
              </div>
            </div>

            {/* My Account */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                My Account
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow">
                  <div className="flex items-center gap-3">
                    <FiUser className="text-slate-400" />
                    <span>Edit Profile</span>
                  </div>
                  <span className="text-slate-300">›</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow">
                  <div className="flex items-center gap-3">
                    <FiShield className="text-slate-400" />
                    <span>Security Settings</span>
                  </div>
                  <span className="text-slate-300">›</span>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Help & Support
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow">
                  <div className="flex items-center gap-3">
                    <FiBookOpen className="text-slate-400" />
                    <span>User Guide</span>
                  </div>
                  <span className="text-slate-300">›</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow">
                  <div className="flex items-center gap-3">
                    <FiMessageCircle className="text-slate-400" />
                    <span>Live Chat Support</span>
                  </div>
                  <span className="text-slate-300">›</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow">
                  <div className="flex items-center gap-3">
                    <FiAlertCircle className="text-slate-400" />
                    <span>Report an Issue</span>
                  </div>
                  <span className="text-slate-300">›</span>
                </div>
              </div>
            </div>

            {/* Sign Out */}
            <Button
              className="w-full rounded-full bg-[var(--brand-secondary)] text-white hover:opacity-90"
              onClick={handleLogout}
            >
              <FiLogOut className="mr-2" /> Sign Out
            </Button>

            {/* Footer links */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Version 3.1.0</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Navbar ─────────────────────────────────────────────────────────────────
export default function Navbar({ activeMonitoring, onToggleMonitoring }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.removeItem("auvia_token");
    localStorage.removeItem("auvia_clinic_id");
    localStorage.removeItem("auvia_user");
    router.push("/");
  }

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("auvia_user") || "{}")
      : {};

  return (
    <>
      <header className="flex items-center justify-between gap-6">
        <div className="relative flex w-full max-w-xl items-center">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <Input
            className="h-10 rounded-full border-slate-200 bg-white pl-9 text-sm"
            placeholder="Search patients or operations..."
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[#00A3AD] bg-white px-3 py-1 text-[11px] text-(--brand-secondary)">
            <span className="font-semibold text-[#00A3AD]">Activate Agent</span>
            <Switch checked={activeMonitoring} onCheckedChange={onToggleMonitoring} />
          </div>

          <Button variant="outline" size="sm" className="h-9 w-9 rounded-full p-0">
            <Bell className="h-4 w-4 text-slate-600" />
          </Button>

          <Button variant="outline" size="sm" className="h-9 w-9 rounded-full p-0">
            <Moon className="h-4 w-4 text-slate-600" />
          </Button>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 rounded-full p-0"
              aria-label="Profile"
              onClick={() => setDropdownOpen((o) => !o)}
            >
              <User className="h-4 w-4 text-slate-600" />
            </Button>

            {dropdownOpen && (
              <div className="absolute right-0 top-11 z-50 w-52 rounded-2xl border border-slate-100 bg-white py-2 shadow-xl">
                <div className="border-b border-slate-100 px-4 pb-2">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {user.name || "Receptionist"}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {user.clinic || ""}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setProfileOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  Profile & Settings
                </button>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile modal — lives outside <header> to cover full viewport */}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}