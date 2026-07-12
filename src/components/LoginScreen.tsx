import React, { useState } from "react";
import { Shield, Eye, EyeOff, Rocket, Check, Lock, Loader2, ArrowRight, ClipboardList, Briefcase, Phone, Clock, BadgeCheck } from "lucide-react";
import { User } from "../types";

interface LoginScreenProps {
  onLoginSuccess: (token: string, user: User) => void;
}

type EnterpriseRole = "Fleet Manager" | "Dispatcher" | "Safety Officer" | "Financial Analyst";

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<EnterpriseRole>("Fleet Manager");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // Role-specific fields
  const [phone, setPhone] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [shift, setShift] = useState("Morning Shift");
  const [certificationNumber, setCertificationNumber] = useState("");
  const [department, setDepartment] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setSuccess(null);
    setEmail("");
    setPassword("");
    setName("");
    setPhone("");
    setEmployeeId("");
    setShift("Morning Shift");
    setCertificationNumber("");
    setDepartment("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your corporate email.");
      return;
    }
    if (!password) {
      setError("Please enter your secure password.");
      return;
    }
    if (isSignUp && !name) {
      setError("Please enter your full name.");
      return;
    }
    if (isSignUp && !employeeId) {
      setError("Employee ID is mandatory for security clearance.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const endpoint = isSignUp ? "/api/auth/register" : "/api/auth/login";
    const payload = isSignUp
      ? {
          email,
          password,
          role,
          name,
          phone: phone || undefined,
          employeeId,
          shift: role === "Dispatcher" ? shift : undefined,
          certificationNumber: role === "Safety Officer" ? certificationNumber : undefined,
          department: (role === "Fleet Manager" || role === "Financial Analyst") ? department : undefined,
        }
      : { email, password, role };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication handshake failed.");
      }

      if (isSignUp) {
        setSuccess("Registration approved! Authenticating corporate session...");
        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess(data.token, data.user);
        }, 1200);
      } else {
        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess(data.token, data.user);
        }, 600);
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || "Failed to establish a secure database link.");
    }
  };

  const autofillRoleEmail = (selectedRole: EnterpriseRole) => {
    setRole(selectedRole);
    setError(null);
    const domain = "@transitops.com";
    let prefix = "fleet";
    if (selectedRole === "Dispatcher") prefix = "dispatch";
    if (selectedRole === "Safety Officer") prefix = "safety";
    if (selectedRole === "Financial Analyst") prefix = "finance";
    
    setEmail(`${prefix}${domain}`);
    setPassword("password123");
  };

  return (
    <div className="flex min-h-screen bg-surface-container-lowest text-on-surface">
      {/* Left Side: Cinematic Branding (Enterprise Fleet Control) */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-end p-16 border-r border-outline-variant/30">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-transparent to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0e12]/60 via-transparent to-transparent z-10"></div>
          <div 
            className="w-full h-full bg-cover bg-center scale-100 hover:scale-105 transition-all duration-700 opacity-80"
            style={{ 
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAQ3lV-y1tB-G2dggbriwrKSmuyeIVawqsryLSXNP8bOF-axGgLfdvhBcLQECheqsxNmhc6BOpXkbrpDcnTnx7VH_kiTUyxqUaNFqMWvP6tHcBbvUXWeiSdOaRze1U6VyngDfCD7dAZjsiE29NrDd_FM963GIwjEpEvBK5_Z4_vNCzLOZA2tnF8AVM2vqVlZEApJ3zl6SvncoYOXbiggMBJIWFzjM8w08bq5kIAiHGldiSkH0f_SRjqBRaHlE_3PmAsH8vLX2m15t4E')` 
            }}
          ></div>
        </div>

        <div className="relative z-20 max-w-xl space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-card border-outline-variant/30">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-sans text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
              Secure Operations Command
            </span>
          </div>
          
          <h1 className="font-display text-4xl lg:text-5xl font-extrabold tracking-tight">
            TransitOps <span className="text-primary font-display">Smart Portal</span>
          </h1>
          
          <p className="font-sans text-on-surface-variant leading-relaxed text-sm lg:text-base">
            TransitOps provides mission-critical reliability for the world's most complex logistics networks. Monitor, manage, and scale with absolute precision.
          </p>

          <div className="flex gap-8 pt-4">
            <div className="space-y-1 border-l-2 border-primary pl-4">
              <div className="font-display text-2xl font-bold">99.9%</div>
              <div className="font-sans text-[10px] font-semibold text-on-surface-variant tracking-wider uppercase">
                UPTIME SLAS
              </div>
            </div>
            <div className="space-y-1 border-l-2 border-primary pl-4">
              <div className="font-display text-2xl font-bold">2ms</div>
              <div className="font-sans text-[10px] font-semibold text-on-surface-variant tracking-wider uppercase">
                REAL-TIME LATENCY
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Side: Authentication Canvas */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-[480px] space-y-8 my-8">
          {/* Branding Header */}
          <div className="flex flex-col items-center lg:items-start space-y-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center shadow-lg shadow-primary-container/20">
                <Rocket className="w-5 h-5 text-on-primary-container" />
              </div>
              <span className="font-display text-2xl font-extrabold text-primary tracking-tight">
                TransitOps
              </span>
            </div>
            <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-on-surface">
              {isSignUp ? "Corporate Registration" : "Operations Login"}
            </h2>
            <p className="font-sans text-sm text-on-surface-variant">
              {isSignUp ? "Register your enterprise security profile." : "Access your corporate command dashboard."}
            </p>
          </div>

          {/* Auth Card */}
          <div className="glass-card p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6 border border-outline-variant/30">
            {error && (
              <div className="p-3 bg-error-container/20 border border-error/50 text-error rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-semibold">
                {success}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Role Selection Tabs */}
              <div className="space-y-2">
                <label className="font-sans text-[10px] font-bold text-on-surface-variant tracking-wider uppercase ml-1">
                  Corporate Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"] as EnterpriseRole[]).map((r) => {
                    const isActive = role === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          if (isSignUp) {
                            setRole(r);
                          } else {
                            autofillRoleEmail(r);
                          }
                        }}
                        className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 ${
                          isActive
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                            : "border-outline-variant/30 bg-surface-container-high/60 text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                      >
                        <span className="font-mono text-[9px] font-extrabold tracking-wider uppercase">
                          {r}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name Input (Sign Up Only) */}
              {isSignUp && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kenneth Vance"
                    className="block w-full px-4 py-2.5 text-sm text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/30"
                  />
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase ml-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@transitops.com"
                  className="block w-full px-4 py-2.5 text-sm text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/30"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-on-surface-variant tracking-wider uppercase ml-1">
                  Secure Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full px-4 py-2.5 text-sm text-on-surface bg-surface-container border border-outline-variant/30 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/70 hover:text-primary transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Dynamic Corporate Role-Specific Fields (Sign Up Only) */}
              {isSignUp && (
                <div className="bg-surface-container/40 p-4 rounded-xl border border-outline-variant/20 space-y-3">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-outline-variant/10 pb-1.5">
                    <ClipboardList className="w-3.5 h-3.5" />
                    Security Credentials: {role}
                  </div>

                  {/* Mandated Employee ID for all */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-on-surface-variant/80 uppercase tracking-wider ml-0.5">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="e.g. EMP-9921-TR"
                      className="block w-full px-3 py-1.5 text-xs text-on-surface bg-surface-container border border-outline-variant/20 rounded-md focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  {/* Fleet Manager specific */}
                  {role === "Fleet Manager" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-on-surface-variant/80 uppercase tracking-wider ml-0.5">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 555-0199"
                          className="block w-full px-3 py-1.5 text-xs text-on-surface bg-surface-container border border-outline-variant/20 rounded-md focus:ring-1 focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-on-surface-variant/80 uppercase tracking-wider ml-0.5">
                          Department
                        </label>
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          placeholder="Northwest Logistics"
                          className="block w-full px-3 py-1.5 text-xs text-on-surface bg-surface-container border border-outline-variant/20 rounded-md focus:ring-1 focus:ring-primary outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Dispatcher specific */}
                  {role === "Dispatcher" && (
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-on-surface-variant/80 uppercase tracking-wider ml-0.5">
                        Active Shift Assignment
                      </label>
                      <select
                        value={shift}
                        onChange={(e) => setShift(e.target.value)}
                        className="block w-full px-3 py-1.5 text-xs text-on-surface bg-surface-container border border-outline-variant/20 rounded-md focus:ring-1 focus:ring-primary outline-none"
                      >
                        <option value="Morning Shift">Morning Shift (06:00 - 14:00)</option>
                        <option value="Evening Shift">Evening Shift (14:00 - 22:00)</option>
                        <option value="Night Shift">Night Shift (22:00 - 06:00)</option>
                      </select>
                    </div>
                  )}

                  {/* Safety Officer specific */}
                  {role === "Safety Officer" && (
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-on-surface-variant/80 uppercase tracking-wider ml-0.5">
                        DOT Safety Certification #
                      </label>
                      <input
                        type="text"
                        required
                        value={certificationNumber}
                        onChange={(e) => setCertificationNumber(e.target.value)}
                        placeholder="DOT-REG-7491-X"
                        className="block w-full px-3 py-1.5 text-xs text-on-surface bg-surface-container border border-outline-variant/20 rounded-md focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  )}

                  {/* Financial Analyst specific */}
                  {role === "Financial Analyst" && (
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-on-surface-variant/80 uppercase tracking-wider ml-0.5">
                        Financial Audit Department
                      </label>
                      <input
                        type="text"
                        required
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="Logistics Capital Audit"
                        className="block w-full px-3 py-1.5 text-xs text-on-surface bg-surface-container border border-outline-variant/20 rounded-md focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {!isSignUp && (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <div 
                      onClick={() => setRememberMe(!rememberMe)}
                      className={`w-4.5 h-4.5 border border-outline rounded flex items-center justify-center transition-colors bg-surface-container hover:border-primary ${
                        rememberMe ? "border-primary bg-primary/10 text-primary" : "border-outline-variant/30"
                      }`}
                    >
                      {rememberMe && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="font-sans text-xs text-on-surface-variant hover:text-on-surface transition-colors">
                      Remember me
                    </span>
                  </label>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setPassword("password123");
                      setError("Autofill password requested. Hit Authorize Entry.");
                    }} 
                    className="font-sans text-xs text-primary hover:underline transition-all"
                  >
                    Auto-fill standard pwd?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary text-[#472a00] font-sans text-sm font-bold rounded-lg hover:bg-[#ffb95f] active:scale-[0.98] transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isSignUp ? "Registering profile..." : "Authorizing entry..."}
                  </>
                ) : (
                  <>
                    {isSignUp ? "Create Secure Profile" : "Authorize Entry"}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Switch flow CTA */}
          <div className="text-center space-y-4">
            <p className="font-sans text-xs text-on-surface-variant">
              {isSignUp ? "Already have a secure clearance?" : "Corporate employee needing credentials?"}
              <button 
                type="button"
                onClick={handleToggleMode}
                className="text-primary font-bold hover:underline ml-1.5 cursor-pointer"
              >
                {isSignUp ? "Log In" : "Register Profile"}
              </button>
            </p>
            <div className="flex items-center justify-center gap-3 text-on-surface-variant/40 text-[11px]">
              <a href="#" className="hover:text-on-surface transition-colors">Privacy Policy</a>
              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
              <a href="#" className="hover:text-on-surface transition-colors">Security Audit</a>
              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
              <a href="#" className="hover:text-on-surface transition-colors">v4.12.0-stable</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
