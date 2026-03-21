

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
import { Search, Bell, Moon, User, LogOut, Settings, X, Camera, Mail, Phone, Building2, Shield, KeyRound } from "lucide-react";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";

// ── Floating Profile Panel ────────────────────────────────────────────────────
function ProfilePanel({ user, onClose }) {
  const [activeTab, setActiveTab] = useState("profile");
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
    { id: "preferences", label: "Preferences" },
  ];

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4 bg-black/10 backdrop-blur-[2px]">
      {/* Panel */}
      <div
        ref={panelRef}
        className="w-[420px] max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-100 bg-white shadow-2xl flex flex-col animate-in fade-in slide-in-from-top-2 duration-200"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#00A3AD] to-[#007A82] px-6 pt-6 pb-10">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-1 text-white hover:bg-white/30 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          {/* Avatar */}
          <div className="relative mx-auto w-fit">
            <div className="h-16 w-16 rounded-full bg-white/30 border-2 border-white flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <button className="absolute -bottom-1 -right-1 rounded-full bg-white p-1 shadow-md hover:bg-slate-50 transition-colors">
              <Camera className="h-3 w-3 text-[#00A3AD]" />
            </button>
          </div>
          <div className="mt-3 text-center text-white">
            <p className="font-semibold text-base">{user.name || "Receptionist"}</p>
            <p className="text-xs text-white/70">{user.clinic || "Clinic"}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-[#00A3AD] text-[#00A3AD] bg-white"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-5">
          {activeTab === "profile" && (
            <div className="space-y-4">
              <Field icon={<User className="h-4 w-4" />} label="Full Name" value={user.name || "—"} editable />
              <Field icon={<Mail className="h-4 w-4" />} label="Email" value={user.email || "—"} editable />
              <Field icon={<Phone className="h-4 w-4" />} label="Phone" value={user.phone || "—"} editable />
              <Field icon={<Building2 className="h-4 w-4" />} label="Clinic" value={user.clinic || "—"} />
              <Field icon={<Shield className="h-4 w-4" />} label="Role" value={user.role || "Receptionist"} />

              <button className="mt-2 w-full rounded-xl bg-[#00A3AD] py-2.5 text-sm font-semibold text-white hover:bg-[#007A82] transition-colors">
                Save Changes
              </button>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <PasswordField label="Current Password" />
              <PasswordField label="New Password" />
              <PasswordField label="Confirm Password" />
              <button className="mt-2 w-full rounded-xl bg-[#00A3AD] py-2.5 text-sm font-semibold text-white hover:bg-[#007A82] transition-colors">
                Update Password
              </button>
              <div className="rounded-xl border border-slate-100 p-4 mt-2">
                <p className="text-xs font-semibold text-slate-700 mb-1">Two-Factor Authentication</p>
                <p className="text-xs text-slate-400 mb-3">Add an extra layer of security to your account.</p>
                <button className="w-full rounded-lg border border-[#00A3AD] py-2 text-xs font-medium text-[#00A3AD] hover:bg-[#00A3AD]/5 transition-colors">
                  Enable 2FA
                </button>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-4">
              {[
                { label: "Email Notifications", desc: "Receive alerts for new appointments" },
                { label: "Dark Mode", desc: "Use dark theme across the app" },
                { label: "Sound Alerts", desc: "Play sound for urgent notifications" },
              ].map((pref) => (
                <div key={pref.label} className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{pref.label}</p>
                    <p className="text-xs text-slate-400">{pref.desc}</p>
                  </div>
                  <Switch />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, value, editable }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  return (
    <div className="rounded-xl border border-slate-100 px-4 py-3 flex items-center gap-3">
      <span className="text-slate-400">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</p>
        {editing ? (
          <input
            autoFocus
            className="w-full text-sm font-medium text-slate-700 border-0 outline-none bg-transparent"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => setEditing(false)}
          />
        ) : (
          <p className="text-sm font-medium text-slate-700 truncate">{val}</p>
        )}
      </div>
      {editable && (
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-[#00A3AD] hover:underline shrink-0"
        >
          Edit
        </button>
      )}
    </div>
  );
}

function PasswordField({ label }) {
  return (
    <div className="rounded-xl border border-slate-100 px-4 py-3 flex items-center gap-3">
      <KeyRound className="h-4 w-4 text-slate-400" />
      <div className="flex-1">
        <p className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</p>
        <input
          type="password"
          placeholder="••••••••"
          className="w-full text-sm font-medium text-slate-700 border-0 outline-none bg-transparent"
        />
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
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
                {/* User info */}
                <div className="border-b border-slate-100 px-4 pb-2">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {user.name || "Receptionist"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{user.clinic || ""}</p>
                </div>

                {/* Open profile popup */}
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

      {/* Floating Profile Panel */}
      {profileOpen && <ProfilePanel user={user} onClose={() => setProfileOpen(false)} />}
    </>
  );
}