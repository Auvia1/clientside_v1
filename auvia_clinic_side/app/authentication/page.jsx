
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   ChevronDown,
//   Eye,
//   EyeOff,
//   Lock,
//   Search,
//   ShieldCheck,
//   User,
// } from "lucide-react";
// import { Button } from "../components/ui/button";
// import { Input } from "../components/ui/input";

// /* ─────────────────────────────────────────────
//    STATIC USERS (NO API)
// ───────────────────────────────────────────── */

// const users = [
//   {
//     id: "rec-001",
//     name: "Priya Shah",
//     username: "priya",
//     clinic: "Auvia Central Clinic",
//     password: "auvia123",
//   },
//   {
//     id: "rec-002",
//     name: "Rohit Rao",
//     username: "rao",
//     clinic: "Auvia North Clinic",
//     password: "auvia123",
//   },
// ];

// const CLINICS = [
//   "Auvia Central Clinic",
//   "Auvia North Clinic",
//   "Auvia East Clinic",
//   "Auvia South Clinic",
// ];

// export default function AuthenticationPage() {
//   const router = useRouter();

//   const [clinic, setClinic] = useState("");
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Redirect if already logged in
//   useEffect(() => {
//     const existingUser = localStorage.getItem("auvia_user");
//     if (existingUser) {
//       router.push("/dashboard");
//     }
//   }, [router]);

//   const isDisabled = useMemo(
//     () => !clinic.trim() || !username.trim() || !password,
//     [clinic, username, password]
//   );

//   const handleSubmit = (event) => {
//   event.preventDefault();
//   setError("");
//   setIsSubmitting(true);

//   const cleanedClinic = clinic.trim().toLowerCase();
//   const cleanedUsername = username.trim().toLowerCase();
//   const cleanedPassword = password.trim();

//   const foundUser = users.find((user) => {
//     return (
//       user.username.toLowerCase() === cleanedUsername &&
//       user.clinic.toLowerCase() === cleanedClinic &&
//       user.password === cleanedPassword
//     );
//   });

//   if (!foundUser) {
//     setError("Invalid clinic or login details. Try again.");
//     setIsSubmitting(false);
//     return;
//   }

//   localStorage.setItem("auvia_user", JSON.stringify(foundUser));
//   router.push("/dashboard");
// };
//   return (
//     <main className="min-h-screen bg-[#f6f9fb] px-4 py-12 text-[var(--brand-secondary)]">
//       <div className="mx-auto flex w-full max-w-[760px] flex-col items-center">
//         <div className="mb-8 flex flex-col items-center gap-2 text-center">
//           <div className="flex items-center gap-2">
//             <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
//               <ShieldCheck className="h-5 w-5" />
//             </span>
//             <span className="text-xl font-semibold">Auvia</span>
//           </div>
//           <p className="text-sm text-slate-500">Virtual Clinic Platform</p>
//         </div>

//         <div className="w-full max-w-[360px] rounded-2xl border border-slate-200 bg-white px-6 py-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
//           <div className="mb-6 text-center">
//             <h1 className="text-lg font-semibold">Receptionist Login</h1>
//             <p className="mt-1 text-xs text-slate-500">
//               Static demo authentication
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Clinic */}
//             <div className="space-y-2">
//               <label className="text-[11px] font-semibold text-slate-600">
//                 Select Your Clinic
//               </label>
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//                 <Input
//                   list="clinic-options"
//                   placeholder="Search your clinic..."
//                   value={clinic}
//                   onChange={(e) => setClinic(e.target.value)}
//                   className="h-11 rounded-xl border-slate-200 pl-9 pr-8 text-sm"
//                 />
//                 <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//                 <datalist id="clinic-options">
//                   {CLINICS.map((name) => (
//                     <option key={name} value={name} />
//                   ))}
//                 </datalist>
//               </div>
//             </div>

//             {/* Username */}
//             <div className="space-y-2">
//               <label className="text-[11px] font-semibold text-slate-600">
//                 Receptionist ID / Name
//               </label>
//               <div className="relative">
//                 <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//                 <Input
//                   placeholder="Enter ID or Name"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   className="h-11 rounded-xl border-slate-200 pl-9 text-sm"
//                 />
//               </div>
//             </div>

//             {/* Password */}
//             <div className="space-y-2">
//               <label className="text-[11px] font-semibold text-slate-600">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//                 <Input
//                   type={showPassword ? "text" : "password"}
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="h-11 rounded-xl border-slate-200 pl-9 pr-10 text-sm"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword((prev) => !prev)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             {error && (
//               <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
//                 {error}
//               </p>
//             )}

//             <Button
//               type="submit"
//               disabled={isDisabled || isSubmitting}
//               className="h-11 w-full rounded-xl text-sm font-semibold"
//             >
//               {isSubmitting ? "Signing In..." : "Sign In"}
//             </Button>
//           </form>
//         </div>
//       </div>
//     </main>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const CLINICS = [
  "Auvia Central Clinic",
  "Auvia North Clinic",
  "Auvia East Clinic",
  "Auvia South Clinic",
];

export default function AuthenticationPage() {
  const router = useRouter();

  const [clinic, setClinic] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const existingUser = localStorage.getItem("auvia_user");
    if (existingUser) {
      router.push("/dashboard");
    }
  }, [router]);

  const isDisabled = useMemo(
    () => !clinic.trim() || !username.trim() || !password,
    [clinic, username, password]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid credentials. Try again.");
        setIsSubmitting(false);
        return;
      }

      const { token, clinic: clinicData } = data;

      // Save everything the app needs to localStorage
      localStorage.setItem("auvia_token", token);
      localStorage.setItem("auvia_clinic_id", clinicData.id);
      localStorage.setItem(
        "auvia_user",
        JSON.stringify({
          id: clinicData.id,
          name: clinicData.name,
          username: clinicData.username,
          clinic: clinicData.name,
          clinic_id: clinicData.id,
        })
      );

      router.push("/dashboard");
    } catch (err) {
      setError("Network error — could not reach the server.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f9fb] px-4 py-12 text-[var(--brand-secondary)]">
      <div className="mx-auto flex w-full max-w-[760px] flex-col items-center">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="text-xl font-semibold">Auvia</span>
          </div>
          <p className="text-sm text-slate-500">Virtual Clinic Platform</p>
        </div>

        <div className="w-full max-w-[360px] rounded-2xl border border-slate-200 bg-white px-6 py-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="mb-6 text-center">
            <h1 className="text-lg font-semibold">Receptionist Login</h1>
            <p className="mt-1 text-xs text-slate-500">
              Sign in with your clinic credentials
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Clinic — kept as a UX hint but not sent to the API */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-600">
                Select Your Clinic
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  list="clinic-options"
                  placeholder="Search your clinic..."
                  value={clinic}
                  onChange={(e) => setClinic(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 pl-9 pr-8 text-sm"
                />
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <datalist id="clinic-options">
                  {CLINICS.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-600">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 pl-9 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-600">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 pl-9 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isDisabled || isSubmitting}
              className="h-11 w-full rounded-xl text-sm font-semibold"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}