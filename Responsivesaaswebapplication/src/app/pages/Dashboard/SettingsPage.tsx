import { useState } from "react";
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge } from "../../components/ui";
import { Lock, CreditCard, Bot, User, Bell, Globe } from "lucide-react";
import { cn } from "../../components/ui";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const TABS = [
    { id: "general", label: "General", icon: User },
    { id: "ai", label: "AI Assistant", icon: Bot },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing & Plans", icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h2>
        <p className="text-slate-500">Manage your business preferences and AI configuration.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.id 
                    ? "bg-slate-100 text-slate-900" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {activeTab === "general" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Business Name</label>
                      <Input defaultValue="Beauty Studio" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Phone Number (WhatsApp)</label>
                      <Input defaultValue="+230 5123 4567" disabled className="bg-slate-50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Address</label>
                    <Input defaultValue="123 Coastal Road, Grand Baie, Mauritius" />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Working Hours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 w-24">{day}</span>
                      <div className="flex items-center gap-2">
                        <Input type="time" defaultValue="09:00" className="w-32" />
                        <span className="text-slate-500">to</span>
                        <Input type="time" defaultValue="18:00" className="w-32" />
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 w-24">Sunday</span>
                    <Badge variant="default" className="w-[280px] justify-center py-2 text-sm bg-slate-100">Closed</Badge>
                  </div>
                  <Button className="mt-4">Save Hours</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Behavior</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900">Auto-Reply</h4>
                      <p className="text-sm text-slate-500">AI automatically responds to incoming messages</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900">Auto-Booking</h4>
                      <p className="text-sm text-slate-500">AI can schedule appointments without your approval</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">AI Personality / Tone</label>
                    <select className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]">
                      <option>Friendly & Professional (Default)</option>
                      <option>Formal & Concise</option>
                      <option>Casual & Enthusiastic (Uses emojis)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Feature Gating Example */}
              <Card className="relative overflow-hidden border-indigo-100">
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Advanced AI Customization</h3>
                  <p className="text-sm text-slate-600 mt-1 max-w-md">Upgrade to Professional to train the AI on your specific cancellation policies, FAQ documents, and custom knowledge base.</p>
                  <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">Upgrade to Pro</Button>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-slate-400">Custom Knowledge Base</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 opacity-50 select-none">
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
                    <p className="text-sm text-slate-500">Upload PDF documents or paste text to train your AI.</p>
                    <Button variant="outline" className="mt-4" disabled>Upload File</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              {/* Subscription State - Expired Warning Example */}
              {/* <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3">
                <Lock className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Your trial has expired</h4>
                  <p className="text-sm mt-1">Please upgrade your plan to continue using BookFlow's AI booking features.</p>
                  <Button size="sm" variant="danger" className="mt-3">Upgrade Now</Button>
                </div>
              </div> */}

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Current Plan</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">You are on the 14-day free trial.</p>
                  </div>
                  <Badge variant="warning">Trial ends in 5 days</Badge>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between mb-6">
                    <div>
                      <p className="font-medium text-slate-900">Starter Plan</p>
                      <p className="text-sm text-slate-500">Rs 990 / month</p>
                    </div>
                    <Button>Upgrade Plan</Button>
                  </div>
                  
                  <h4 className="text-sm font-medium text-slate-900 mb-4">Payment Method</h4>
                  <div className="border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-6 bg-slate-200 rounded flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-slate-500" />
                      </div>
                      <span className="text-sm text-slate-600">No payment method added</span>
                    </div>
                    <Button variant="outline" size="sm">Add Card</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}