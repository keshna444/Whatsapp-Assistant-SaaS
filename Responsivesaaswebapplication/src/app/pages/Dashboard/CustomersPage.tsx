import { Button, Input, Badge } from "../../components/ui";
import { Search, Plus, MoreHorizontal, MessageCircle, Calendar } from "lucide-react";

const CUSTOMERS = [
  { id: 1, name: "Sarah Connor", phone: "+230 5123 4567", totalBookings: 12, totalSpent: "Rs 9,600", lastVisit: "2 days ago", status: "loyal" },
  { id: 2, name: "John Smith", phone: "+230 5987 6543", totalBookings: 3, totalSpent: "Rs 1,500", lastVisit: "1 week ago", status: "active" },
  { id: 3, name: "Emma Watson", phone: "+230 5555 1234", totalBookings: 1, totalSpent: "Rs 1,200", lastVisit: "Tomorrow", status: "new" },
  { id: 4, name: "Michael Brown", phone: "+230 5777 8888", totalBookings: 5, totalSpent: "Rs 1,500", lastVisit: "1 month ago", status: "slipping" },
];

export function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Customers</h2>
          <p className="text-slate-500">Manage your client list and booking history.</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input className="pl-9" placeholder="Search customers..." />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Bookings</th>
              <th className="px-6 py-4">Total Spent</th>
              <th className="px-6 py-4">Last Visit</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {CUSTOMERS.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium shrink-0">
                      {customer.name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{customer.name}</div>
                      <Badge variant={
                        customer.status === 'loyal' ? 'success' : 
                        customer.status === 'new' ? 'default' : 
                        customer.status === 'slipping' ? 'danger' : 'warning'
                      } className="mt-1 text-[10px] px-1.5 py-0">
                        {customer.status}
                      </Badge>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{customer.phone}</td>
                <td className="px-6 py-4 text-slate-600">{customer.totalBookings}</td>
                <td className="px-6 py-4 text-slate-900 font-medium">{customer.totalSpent}</td>
                <td className="px-6 py-4 text-slate-600">{customer.lastVisit}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-slate-400 hover:text-[#25D366] rounded-lg hover:bg-green-50" title="WhatsApp Chat">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {CUSTOMERS.map((customer) => (
          <div key={customer.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium shrink-0">
                  {customer.name.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">{customer.name}</h3>
                  <p className="text-xs text-slate-500">{customer.phone}</p>
                </div>
              </div>
              <Badge variant={
                customer.status === 'loyal' ? 'success' : 
                customer.status === 'new' ? 'default' : 
                customer.status === 'slipping' ? 'danger' : 'warning'
              }>
                {customer.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 my-3 text-sm">
              <div>
                <span className="text-slate-500 text-xs flex items-center gap-1 mb-1"><Calendar className="w-3 h-3"/> Bookings</span>
                <p className="font-medium text-slate-900">{customer.totalBookings}</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs block mb-1">Total Spent</span>
                <p className="font-medium text-slate-900">{customer.totalSpent}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-slate-500">Last visit: {customer.lastVisit}</span>
              <Button variant="secondary" size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}