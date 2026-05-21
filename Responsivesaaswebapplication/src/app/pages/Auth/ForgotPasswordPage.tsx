import { useState } from "react";
import { Link } from "react-router";
import { Button, Card, CardContent, Input } from "../../components/ui";
import { CheckCircle2, ArrowLeft, KeyRound } from "lucide-react";
import bookFlowLogo from "../../../styles/BookFlowLogo.png";

type View = "request" | "sent" | "reset" | "done";

export function ForgotPasswordPage() {
  const [view, setView] = useState<View>("request");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Frontend placeholder — backend will handle actual email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setView("sent");
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    // Frontend placeholder
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setView("done");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">

        {/* Logo */}
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <img src={bookFlowLogo} alt="BookFlow" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-bold tracking-tight text-slate-900">BookFlow</span>
          </Link>
        </div>

        {/* ── View: Request reset ── */}
        {view === "request" && (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Forgot your password?</h2>
              <p className="mt-2 text-sm text-slate-600">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleRequestReset} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium leading-none text-slate-700">
                      Email address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                  <Button type="submit" fullWidth size="lg" disabled={loading}>
                    {loading ? "Sending reset link…" : "Send Reset Link"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <p className="text-center text-sm text-slate-600">
              Remember your password?{' '}
              <Link to="/login" className="font-medium text-[#25D366] hover:text-[#1fae54]">
                Back to login
              </Link>
            </p>
          </>
        )}

        {/* ── View: Email sent ── */}
        {view === "sent" && (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-[#25D366]" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h2>
              <p className="text-slate-600 text-sm mb-2">
                If an account exists for{' '}
                <span className="font-semibold text-slate-800">{email}</span>,
                you'll receive a reset link shortly.
              </p>
              <p className="text-slate-400 text-xs mb-8">
                Didn't receive it? Check your spam folder or try a different email.
              </p>
              <div className="space-y-3">
                <Button
                  fullWidth
                  onClick={() => setView("reset")}
                  className="gap-2"
                >
                  <KeyRound className="h-4 w-4" />
                  Set New Password
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => { setView("request"); setEmail(""); }}
                >
                  Try a different email
                </Button>
                <Link to="/login">
                  <Button variant="outline" fullWidth className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── View: Set new password ── */}
        {view === "reset" && (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Set new password</h2>
              <p className="mt-2 text-sm text-slate-600">
                Choose a strong password for your account.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSetPassword} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="new-password" className="text-sm font-medium leading-none text-slate-700">
                        New password
                      </label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Min. 6 characters"
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="confirm-password" className="text-sm font-medium leading-none text-slate-700">
                        Confirm new password
                      </label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Repeat your password"
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" fullWidth size="lg" disabled={loading}>
                    {loading ? "Updating password…" : "Reset Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <p className="text-center text-sm text-slate-600">
              <button
                onClick={() => setView("sent")}
                className="font-medium text-[#25D366] hover:text-[#1fae54]"
              >
                ← Back
              </button>
            </p>
          </>
        )}

        {/* ── View: Done ── */}
        {view === "done" && (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-[#25D366]" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Password updated!</h2>
              <p className="text-slate-600 text-sm mb-8">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
              <Link to="/login">
                <Button fullWidth size="lg">Go to Login</Button>
              </Link>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
