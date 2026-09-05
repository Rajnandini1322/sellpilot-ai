"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

type StoredUser = {
  name: string;
  email: string;
};

const SESSION_KEY = "sellpilot-user";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored =
      localStorage.getItem(SESSION_KEY) ||
      sessionStorage.getItem(SESSION_KEY);

    if (stored) {
      router.replace("/");
    }
  }, [router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    const user: StoredUser = {
      name: mode === "signup" ? name.trim() : email.split("@")[0],
      email: email.trim(),
    };

    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);

    if (remember) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }

    setTimeout(() => {
      router.replace("/");
    }, 350);
  }

  return (
    <main className="sp-auth-page">
      <div className="sp-auth-background">
        <div className="sp-auth-glow sp-auth-glow-one" />
        <div className="sp-auth-glow sp-auth-glow-two" />
        <div className="sp-auth-grid" />
      </div>

      <div className="sp-auth-shell">
        <div className="sp-auth-brand">
          <div className="sp-brand-mark">
            <Sparkles size={20} />
          </div>
          <div>
            <strong>SellPilot AI</strong>
            <span>AI Revenue Assistant</span>
          </div>
        </div>

        <div className="sp-auth-layout">
          <section className="sp-auth-intro">
            <div className="sp-auth-badge">
              <Zap size={14} />
              INTERNSHIP PROJECT – PRO LEVEL
            </div>

            <h1>
              Turn every order into
              <span> smarter revenue.</span>
            </h1>

            <p>
              AI-powered commerce intelligence that helps merchants discover
              opportunities, understand customers and grow revenue.
            </p>

            <div className="sp-auth-benefits">
              <AuthBenefit
                icon={<TrendingUp size={18} />}
                title="AI Revenue Intelligence"
                text="Discover high-value opportunities automatically."
              />
              <AuthBenefit
                icon={<Sparkles size={18} />}
                title="Smart Recommendations"
                text="Personalized product discovery and upselling."
              />
              <AuthBenefit
                icon={<LockKeyhole size={18} />}
                title="Secure Commerce"
                text="Server-side payment verification and audit trails."
              />
            </div>

            <div className="sp-auth-project-note">
              <strong>75K-LEVEL PROJECT</strong>
              <span>
                Next.js • TypeScript • Prisma • SQLite • Razorpay • AI
              </span>
            </div>
          </section>

          <section className="sp-login-card">
            <div className="sp-login-card-header">
              <div>
                <h2>{mode === "login" ? "Welcome back" : "Create account"}</h2>
                <p>
                  {mode === "login"
                    ? "Sign in to your commerce intelligence dashboard."
                    : "Create your merchant account to get started."}
                </p>
              </div>
            </div>

            <div className="sp-auth-tabs">
              <button
                type="button"
                className={mode === "login" ? "active" : ""}
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                Login
              </button>

              <button
                type="button"
                className={mode === "signup" ? "active" : ""}
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
              >
                Sign up
              </button>
            </div>

            <form className="sp-login-form" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <label className="sp-field">
                  <span>Full name</span>
                  <div className="sp-input-wrap">
                    <Sparkles size={17} />
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </div>
                </label>
              )}

              <label className="sp-field">
                <span>Email address</span>
                <div className="sp-input-wrap">
                  <Mail size={17} />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </label>

              <label className="sp-field">
                <span>Password</span>
                <div className="sp-input-wrap">
                  <LockKeyhole size={17} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                  />
                  <button
                    type="button"
                    className="sp-password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>

              <div className="sp-login-options">
                <label className="sp-checkbox">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />
                  <span>Remember me</span>
                </label>

                <button type="button" className="sp-forgot">
                  Forgot password?
                </button>
              </div>

              {error && <div className="sp-auth-error">{error}</div>}

              <button
                type="submit"
                className="sp-login-button"
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : mode === "login"
                    ? "Login"
                    : "Create account"}

                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="sp-login-divider">
              <span>SECURE MERCHANT ACCESS</span>
            </div>

            <div className="sp-login-footer">
              <span>Protected by SellPilot AI security controls</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function AuthBenefit({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="sp-auth-benefit">
      <div className="sp-auth-benefit-icon">{icon}</div>
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}
