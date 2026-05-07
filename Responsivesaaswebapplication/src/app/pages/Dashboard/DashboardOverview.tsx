import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "../../components/ui";
import { Users, Calendar, TrendingUp, MessageCircle, ArrowUpRight, Clock } from "lucide-react";

export function DashboardOverview() {
  const stats = [
    { label: "Total Bookings", value: "124", icon: Calendar, change: "+12%", trend: "up" },
    { label: "AI Handled Chats", value: "342", icon: MessageCircle, change: "+18%", trend: "up" },
    { label: "Revenue (Est)", value: "Rs 45,200", icon: TrendingUp, change: "+8%", trend: "up" },
    { label: "New Customers", value: "28", icon: Users, change: "+24%", trend: "up" },
  ];

  const recentBookings = [
    { id: 1, customer: "Sarah Connor", service: "Gel Manicure", time: "Today, 2:30 PM", price: "Rs 800", status: "confirmed" },
    { id: 2, customer: "John Smith", service: "Men's Haircut", time: "Today, 4:00 PM", price: "Rs 500", status: "confirmed" },
    { id: 3, customer: "Emma Watson", service: "Full Set Lashes", time: "Tomorrow, 10:00 AM", price: "Rs 1,200", status: "pending" },
    { id: 4, customer: "Michael Brown", service: "Beard Trim", time: "Tomorrow, 11:30 AM", price: "Rs 300", status: "confirmed" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h2>
          <p className="text-slate-500">Here's what's happening with your business today.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">Share Link</Button>
          <Button className="flex-1 sm:flex-none">New Booking</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <stat.icon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="flex items-center text-[#25D366] font-medium">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  {stat.change}
                </span>
                <span className="text-slate-500 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-semibold">Upcoming Appointments</CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium shrink-0">
                      {booking.customer.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{booking.customer}</p>
                      <p className="text-sm text-slate-500">{booking.service}</p>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                    <div className="flex items-center text-sm text-slate-600">
                      <Clock className="w-4 h-4 mr-1.5" />
                      {booking.time}
                    </div>
                    <Badge variant={booking.status === 'confirmed' ? 'success' : 'warning'}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Performance */}
        <Card>
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-semibold">AI Assistant</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700">Success Rate</span>
                  <span className="text-[#25D366] font-semibold">94%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-[#25D366] h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Chats that ended in a booking or resolved inquiry without human takeover.</p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-medium text-slate-900 mb-4">Recent AI Actions</h4>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#25D366] mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-700">Booked <span className="font-medium">Lisa M.</span> for Gel Nails</p>
                      <p className="text-xs text-slate-500">2 mins ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-700">Answered pricing question for <span className="font-medium">+230 5XXX XXXX</span></p>
                      <p className="text-xs text-slate-500">15 mins ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-700">Handed over complex query to human</p>
                      <p className="text-xs text-slate-500">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}