import { useState, useEffect } from "react";
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge } from "../../components/ui";
import { Lock, CreditCard, Bot, User, Bell } from "lucide-react";
import { cn } from "../../components/ui";
import { apiFetch } from "../../utils/api";

type OpeningHours = { open: string; close: string };

type Profile = {
  businessName: string;
  businessType: string;
  phone: string;
  address: string;
  description: string;
  openingDays: string[];
  openingHours: OpeningHours;
  bookingNotes: string;
  aiInstructions: string;
  whatsappNumber: string;
};

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_PROFILE: Profile = {
  businessName: '',
  businessType: 'salon',
  phone: '',
  address: '',
  description: '',
  openingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  openingHours: { open: '09:00', close: '18:00' },
  bookingNotes: '',
  aiInstructions: '',
  whatsappNumber: '',
};

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const TABS = [
    { id: "general", label: "General", icon: User },
    { id: "ai", label: "AI Assistant", icon: Bot },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing & Plans", icon: CreditCard },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await apiFetch('/business/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile({
            businessName: data.businessName || '',
            businessType: data.businessType || 'salon',
            phone: data.phone || '',
            address: data.address || '',
            description: data.description || '',
            openingDays: data.openingDays || DEFAULT_PROFILE.openingDays,
            openingHours: data.openingHours || DEFAULT_PROFILE.openingHours,
            bookingNotes: data.bookingNotes || '',
            aiInstructions: data.aiInstructions || '',
            whatsappNumber: data.whatsappNumber || '',
          });
        }
      } catch {
        // not connected or no profile yet — start with empty form
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await apiFetch('/business/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Save failed.');
      }
      setProfileMsg({ type: 'success', text: 'Business profile saved successfully.' });
    } catch (err: unknown) {
      setProfileMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleDay = (day: string) => {
    setProfile(p => ({
      ...p,
      openingDays: p.openingDays.includes(day)
        ? p.openingDays.filter(d => d !== day)
        : [...p.openingDays, day],
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h2>
        <p className="text-slate-500">Manage your business preferences and AI configuration.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation */}
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

        {/* Content */}
        <div className="flex-1">
          {activeTab === "general" && (
            <div className="space-y-6">
              {profileMsg && (
                <div className={cn(
                  "p-3 rounded-lg text-sm border",
                  profileMsg.type === 'success'
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                )}>
                  {profileMsg.text}
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Business Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingProfile ? (
                    <div className="text-center py-6 text-slate-400 text-sm">Loading profile…</div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Business Name *</label>
                          <Input
                            placeholder="e.g. Beauty Studio"
                            value={profile.businessName}
                            onChange={e => setProfile(p => ({ ...p, businessName: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Business Type *</label>
                          <select
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                            value={profile.businessType}
                            onChange={e => setProfile(p => ({ ...p, businessType: e.target.value }))}
                          >
                            <option value="salon">Salon</option>
                            <option value="barber">Barber</option>
                            <option value="clinic">Clinic</option>
                            <option value="sme">SME</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Phone Number</label>
                          <Input
                            placeholder="+230 5123 4567"
                            value={profile.phone}
                            onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">WhatsApp Number</label>
                          <Input
                            placeholder="+230 5123 4567"
                            value={profile.whatsappNumber}
                            onChange={e => setProfile(p => ({ ...p, whatsappNumber: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Address</label>
                        <Input
                          placeholder="123 Coastal Road, Grand Baie, Mauritius"
                          value={profile.address}
                          onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Description</label>
                        <textarea
                          className="flex w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] min-h-[72px] resize-none"
                          placeholder="Brief description of your business…"
                          value={profile.description}
                          onChange={e => setProfile(p => ({ ...p, description: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Booking Notes</label>
                        <textarea
                          className="flex w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] min-h-[72px] resize-none"
                          placeholder="Notes shown to customers when booking (e.g. 'Please arrive 5 minutes early')…"
                          value={profile.bookingNotes}
                          onChange={e => setProfile(p => ({ ...p, bookingNotes: e.target.value }))}
                        />
                      </div>
                    </>
                  )}
                  <Button onClick={handleSaveProfile} disabled={savingProfile || loadingProfile}>
                    {savingProfile ? "Saving…" : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Working Hours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Opening Time</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        className="w-32"
                        value={profile.openingHours.open}
                        onChange={e => setProfile(p => ({ ...p, openingHours: { ...p.openingHours, open: e.target.value } }))}
                      />
                      <span className="text-slate-500">to</span>
                      <Input
                        type="time"
                        className="w-32"
                        value={profile.openingHours.close}
                        onChange={e => setProfile(p => ({ ...p, openingHours: { ...p.openingHours, close: e.target.value } }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Open Days</label>
                    <div className="flex flex-wrap gap-2">
                      {ALL_DAYS.map(day => (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                            profile.openingDays.includes(day)
                              ? "bg-[#25D366] text-white border-[#25D366]"
                              : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                          )}
                        >
                          {day.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile} disabled={savingProfile}>
                    {savingProfile ? "Saving…" : "Save Hours"}
                  </Button>
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
                    <label className="text-sm font-medium text-slate-700">AI Instructions</label>
                    <textarea
                      className="flex w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] min-h-[100px] resize-none"
                      placeholder="Custom instructions for the AI (e.g. 'Always greet customers by name. Do not offer discounts. Cancellation must be done 24h in advance.')…"
                      value={profile.aiInstructions}
                      onChange={e => setProfile(p => ({ ...p, aiInstructions: e.target.value }))}
                    />
                    <Button onClick={handleSaveProfile} disabled={savingProfile} size="sm">
                      {savingProfile ? "Saving…" : "Save Instructions"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

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

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'New booking notifications', desc: 'Get notified when a customer books an appointment' },
                  { label: 'Booking reminders', desc: 'Send automated reminders 2 hours before appointments' },
                  { label: 'Cancellation alerts', desc: 'Get notified when a customer cancels' },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <h4 className="font-medium text-slate-900 text-sm">{label}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
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
