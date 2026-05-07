import { Button, Input, Badge } from "../../components/ui";
import { Search, Plus, MoreHorizontal, Scissors, Clock } from "lucide-react";

const SERVICES = [
  { id: 1, name: "Gel Manicure", category: "Nails", price: "Rs 800", duration: "45 min", status: "active", bookings: 45 },
  { id: 2, name: "Acrylic Extensions", category: "Nails", price: "Rs 1,500", duration: "90 min", status: "active", bookings: 28 },
  { id: 3, name: "Pedicure", category: "Nails", price: "Rs 900", duration: "60 min", status: "active", bookings: 32 },
  { id: 4, name: "Full Set Lashes", category: "Lashes", price: "Rs 1,200", duration: "120 min", status: "active", bookings: 15 },
  { id: 5, name: "Lash Refill", category: "Lashes", price: "Rs 600", duration: "45 min", status: "inactive", bookings: 8 },
];

export function ServicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Services</h2>
          <p className="text-slate-500">Manage your offerings, prices, and durations.</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input className="pl-9" placeholder="Search services..." />
        </div>
        <select className="flex h-10 w-full sm:w-48 rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]">
          <option>All Categories</option>
          <option>Nails</option>
          <option>Lashes</option>
        </select>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-4">Service Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {SERVICES.map((service) => (
              <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{service.name}</td>
                <td className="px-6 py-4 text-slate-600">{service.category}</td>
                <td className="px-6 py-4 text-slate-600">{service.duration}</td>
                <td className="px-6 py-4 text-slate-900 font-medium">{service.price}</td>
                <td className="px-6 py-4">
                  <Badge variant={service.status === 'active' ? 'success' : 'default'}>
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </Badge>
                </td>
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
        {SERVICES.map((service) => (
          <div key={service.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-slate-900 text-lg">{service.name}</h3>
              <Badge variant={service.status === 'active' ? 'success' : 'default'}>
                {service.status}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                {service.category}
              </span>
              <span className="inline-flex items-center text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                <Clock className="w-3 h-3 mr-1" />
                {service.duration}
              </span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <div>
                <span className="text-xs text-slate-500 block">Price</span>
                <span className="font-semibold text-slate-900">{service.price}</span>
              </div>
              <Button variant="outline" size="sm">Edit Service</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}