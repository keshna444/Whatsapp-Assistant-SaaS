import { useState } from "react";
import { Button, Input, Badge } from "../../components/ui";
import { Calendar as CalendarIcon, Clock, Search, Filter, MoreHorizontal, User, Scissors } from "lucide-react";

const BOOKINGS = [
  { id: 1, customer: "Sarah Connor", phone: "+230 5123 4567", service: "Gel Manicure", date: "Today", time: "2:30 PM", duration: "45 min", price: "Rs 800", status: "confirmed" },
  { id: 2, customer: "John Smith", phone: "+230 5987 6543", service: "Men's Haircut", date: "Today", time: "4:00 PM", duration: "30 min", price: "Rs 500", status: "confirmed" },
  { id: 3, customer: "Emma Watson", phone: "+230 5555 1234", service: "Full Set Lashes", date: "Tomorrow", time: "10:00 AM", duration: "120 min", price: "Rs 1,200", status: "pending" },
  { id: 4, customer: "Michael Brown", phone: "+230 5777 8888", service: "Beard Trim", date: "Tomorrow", time: "11:30 AM", duration: "15 min", price: "Rs 300", status: "confirmed" },
  { id: 5, customer: "Lisa Kudrow", phone: "+230 5111 2222", service: "Pedicure", date: "Oct 24", time: "1:00 PM", duration: "60 min", price: "Rs 900", status: "cancelled" },
];

export function BookingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Bookings</h2>
          <p className="text-slate-500">Manage your schedule and appointments.</p>
        </div>
        <Button className="w-full sm:w-auto">Add Booking</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input className="pl-9" placeholder="Search customer or service..." />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Today
          </Button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Service</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {BOOKINGS.map((booking) => (
              <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{booking.customer}</div>
                  <div className="text-slate-500 text-xs">{booking.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-900">{booking.service}</div>
                  <div className="text-slate-500 text-xs">{booking.duration}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-900 font-medium">{booking.date}</div>
                  <div className="text-slate-500 text-xs">{booking.time}</div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={
                    booking.status === 'confirmed' ? 'success' : 
                    booking.status === 'pending' ? 'warning' : 'danger'
                  }>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-slate-900">{booking.price}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {BOOKINGS.map((booking) => (
          <div key={booking.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">{booking.customer}</h3>
                  <p className="text-xs text-slate-500">{booking.phone}</p>
                </div>
              </div>
              <Badge variant={
                booking.status === 'confirmed' ? 'success' : 
                booking.status === 'pending' ? 'warning' : 'danger'
              }>
                {booking.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 my-3 text-sm">
              <div>
                <span className="text-slate-500 text-xs flex items-center gap-1 mb-1"><Scissors className="w-3 h-3"/> Service</span>
                <p className="font-medium text-slate-900">{booking.service}</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs flex items-center gap-1 mb-1"><Clock className="w-3 h-3"/> Time</span>
                <p className="font-medium text-slate-900">{booking.date}, {booking.time}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-3">
              <span className="font-medium text-slate-900">{booking.price}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="secondary" size="sm">Chat</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}