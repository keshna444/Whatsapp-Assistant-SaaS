import { Link, useNavigate } from "react-router";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "../../components/ui";
import bookFlowLogo from "../../../styles/BookFlowLogo.png";

export function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <img src={bookFlowLogo} alt="BookFlow" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-bold tracking-tight text-slate-900">BookFlow</span>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to manage your bookings and settings
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium leading-none text-slate-700">Email address</label>
                  <Input id="email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium leading-none text-slate-700">Password</label>
                    <a href="#" className="text-sm font-medium text-[#25D366] hover:text-[#1fae54]">Forgot password?</a>
                  </div>
                  <Input id="password" type="password" placeholder="••••••••" required />
                </div>
              </div>

              <Button type="submit" fullWidth size="lg">Sign in</Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-[#25D366] hover:text-[#1fae54]">
            Start your 14-day free trial
          </Link>
        </p>
      </div>
    </div>
  );
}