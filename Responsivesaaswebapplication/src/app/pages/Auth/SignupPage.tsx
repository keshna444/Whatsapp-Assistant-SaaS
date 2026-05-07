import { Link, useNavigate } from "react-router";
import { Button, Card, CardContent, Input } from "../../components/ui";
import bookFlowLogo from "../../../styles/BookFlowLogo.png";

export function SignupPage() {
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <img src={bookFlowLogo} alt="BookFlow" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-bold tracking-tight text-slate-900">BookFlow</span>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create your account</h2>
          <p className="mt-2 text-sm text-slate-600">
            Start your 14-day free trial. No credit card required.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium leading-none text-slate-700">Full Name</label>
                  <Input id="name" type="text" placeholder="Jane Doe" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="business" className="text-sm font-medium leading-none text-slate-700">Business Name</label>
                  <Input id="business" type="text" placeholder="Jane's Beauty Studio" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium leading-none text-slate-700">Email address</label>
                  <Input id="email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium leading-none text-slate-700">Password</label>
                  <Input id="password" type="password" placeholder="••••••••" required />
                </div>
              </div>

              <Button type="submit" fullWidth size="lg">Create Account</Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[#25D366] hover:text-[#1fae54]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}