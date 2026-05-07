import { useState } from "react";
import { Search, MoreVertical, Phone, Video, Bot, User, ArrowLeft } from "lucide-react";
import { cn, Input } from "../../components/ui";

const CONVERSATIONS = [
  { id: 1, name: "Sarah Connor", phone: "+230 5123 4567", lastMessage: "Perfect, see you tomorrow!", time: "10:45 AM", unread: 0, status: "ai_active" },
  { id: 2, name: "+230 5987 6543", phone: "+230 5987 6543", lastMessage: "Do you offer balayage?", time: "09:30 AM", unread: 2, status: "human_needed" },
  { id: 3, name: "Emma Watson", phone: "+230 5555 1234", lastMessage: "Can I reschedule my appointment?", time: "Yesterday", unread: 0, status: "ai_active" },
  { id: 4, name: "Michael Brown", phone: "+230 5777 8888", lastMessage: "Thanks for the reminder.", time: "Yesterday", unread: 0, status: "ai_active" },
];

export function ConversationsPage() {
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);

  const handleSelectChat = (id: number) => {
    setActiveChat(id);
    setIsMobileListVisible(false); // Hide list on mobile when chat is selected
  };

  const handleBackToList = () => {
    setIsMobileListVisible(true);
  };

  const activeUser = CONVERSATIONS.find(c => c.id === activeChat);

  return (
    <div className="h-[calc(100vh-8rem)] -m-4 sm:-m-6 lg:-m-8 bg-white flex overflow-hidden border-t border-slate-200">
      
      {/* Sidebar / Conversation List */}
      <div className={cn(
        "w-full md:w-80 lg:w-96 flex-col border-r border-slate-200 bg-white z-10",
        isMobileListVisible ? "flex" : "hidden md:flex"
      )}>
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Conversations</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input className="pl-9 bg-slate-50" placeholder="Search chats..." />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {CONVERSATIONS.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className={cn(
                "p-4 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50",
                activeChat === chat.id ? "bg-slate-50" : ""
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-slate-900 truncate pr-2">{chat.name}</h3>
                <span className="text-xs text-slate-500 whitespace-nowrap">{chat.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-600 truncate pr-4">{chat.lastMessage}</p>
                {chat.unread > 0 && (
                  <span className="bg-[#25D366] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0">
                    {chat.unread}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-1">
                {chat.status === 'ai_active' ? (
                  <span className="inline-flex items-center text-[10px] font-medium text-[#25D366] bg-[#25D366]/10 px-1.5 py-0.5 rounded">
                    <Bot className="w-3 h-3 mr-1" /> AI Active
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    <User className="w-3 h-3 mr-1" /> Handover Needed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 flex-col bg-[#E5DDD5] relative",
        !isMobileListVisible ? "flex" : "hidden md:flex"
      )}>
        {activeUser ? (
          <>
            {/* Chat Header */}
            <div className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900"
                  onClick={handleBackToList}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-medium text-slate-600 shrink-0">
                  {activeUser.name.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{activeUser.name}</h3>
                  <p className="text-xs text-slate-500">{activeUser.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full hidden sm:block"><Video className="w-5 h-5" /></button>
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full hidden sm:block"><Phone className="w-5 h-5" /></button>
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>

            {/* AI Control Banner */}
            <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200 p-2 flex justify-between items-center px-4 shrink-0">
              <div className="flex items-center gap-2">
                <Bot className={cn("w-4 h-4", activeUser.status === 'ai_active' ? "text-[#25D366]" : "text-slate-400")} />
                <span className="text-sm font-medium text-slate-700">
                  {activeUser.status === 'ai_active' ? 'AI is managing this chat' : 'AI paused - Human taking over'}
                </span>
              </div>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md">
                {activeUser.status === 'ai_active' ? 'Take Over' : 'Resume AI'}
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-center">
                <span className="text-xs font-medium text-slate-500 bg-white/60 px-2 py-1 rounded-md">Today</span>
              </div>
              
              <div className="flex justify-start">
                <div className="bg-white rounded-lg p-3 max-w-[85%] sm:max-w-[70%] shadow-sm">
                  <p className="text-sm text-slate-900">Hi, can I book a gel manicure for tomorrow?</p>
                  <span className="text-[10px] text-slate-400 block text-right mt-1">10:42 AM</span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <div className="bg-[#DCF8C6] rounded-lg p-3 max-w-[85%] sm:max-w-[70%] shadow-sm relative group">
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Bot className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-900">
                    Hello! 👋 I can help you with that. We have these times available tomorrow for a Gel Manicure (Rs 800, 45 mins):
                    <br/><br/>
                    1. 2:00 PM<br/>
                    2. 3:30 PM<br/>
                    3. 4:15 PM
                    <br/><br/>
                    Please reply with the number of your preferred time.
                  </p>
                  <span className="text-[10px] text-slate-500 block text-right mt-1">10:42 AM</span>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-white rounded-lg p-3 max-w-[85%] sm:max-w-[70%] shadow-sm">
                  <p className="text-sm text-slate-900">2</p>
                  <span className="text-[10px] text-slate-400 block text-right mt-1">10:44 AM</span>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-[#DCF8C6] rounded-lg p-3 max-w-[85%] sm:max-w-[70%] shadow-sm relative group">
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Bot className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-900">
                    Perfect! I've booked you in for a Gel Manicure tomorrow at 3:30 PM. 🎉
                    <br/><br/>
                    You'll receive a reminder 2 hours before your appointment. See you then!
                  </p>
                  <span className="text-[10px] text-slate-500 block text-right mt-1">10:44 AM</span>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-white rounded-lg p-3 max-w-[85%] sm:max-w-[70%] shadow-sm">
                  <p className="text-sm text-slate-900">Perfect, see you tomorrow!</p>
                  <span className="text-[10px] text-slate-400 block text-right mt-1">10:45 AM</span>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="p-3 bg-white z-10 shrink-0">
              <div className="flex items-end gap-2 bg-slate-50 rounded-xl p-2 border border-slate-200">
                <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full shrink-0">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                </button>
                <textarea 
                  className="flex-1 max-h-32 min-h-[40px] bg-transparent resize-none focus:outline-none py-2 text-sm text-slate-900"
                  placeholder="Type a message..."
                  rows={1}
                ></textarea>
                <button className="w-10 h-10 rounded-full bg-[#128C7E] flex items-center justify-center text-white shrink-0 hover:bg-[#075E54] transition-colors">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-2">BookFlow Web</h3>
            <p className="max-w-md">Select a conversation to read messages or send a reply. The AI handles basic bookings automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
}