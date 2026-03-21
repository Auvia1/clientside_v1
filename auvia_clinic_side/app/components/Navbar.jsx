

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

// ─── Inline Profile Modal ───────────────────────────────────────────────────
function ProfileModal({ open, onClose }) {
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

  if (!open) return null;

  return (
    // Backdrop — click outside closes modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ✅ Paste your existing profile_section page content here, unchanged */}
        <div className="p-6">
          {/* YOUR PROFILE CONTENT GOES HERE */}
        </div>
      </div>
    </div>
  );
}

// ─── Navbar ─────────────────────────────────────────────────────────────────
export default function Navbar({ activeMonitoring, onToggleMonitoring }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false); // 👈 new
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

  const user = typeof window !== "undefined"
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
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {user.name || "Receptionist"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user.clinic || ""}
                  </p>
                </div>

                {/* 👇 Only change: was <Link>, now opens modal */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setProfileOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  Profile & Settings
                </button>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal lives outside <header> so it can cover the full viewport */}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}