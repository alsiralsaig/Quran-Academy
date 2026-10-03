import React, { useState } from 'react';
import {
  Users,
  Video,
  Mic,
  MicOff,
  Hand,
  Volume2,
  Award,
  Plus,
  Clock,
  Play,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Shield,
  Star,
  UserCheck
} from 'lucide-react';
import { UserRole } from '../../types';
import { CollaborativeGroupRecitationRoom } from '../quran/CollaborativeGroupRecitationRoom';

export interface GroupParticipant {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  avatar?: string;
  isReciting: boolean;
  hasRaisedHand: boolean;
  hasCompletedTurn: boolean;
  score: number;
}

export interface GroupStudySession {
  id: string;
  title: string;
  surahFocus: string;
  teacherName: string;
  meetingUrl: string;
  maxStudents: number;
  activeReciterId?: string;
  status: 'live' | 'upcoming' | 'ended';
  participants: GroupParticipant[];
}

interface GroupStudyRoomProps {
  userRole: UserRole;
  userName: string;
}

export const GroupStudyRoom: React.FC<GroupStudyRoomProps> = ({ userRole, userName }) => {
  // Active room state
  const [activeSession, setActiveSession] = useState<GroupStudySession>({
    id: 'group_room_1',
    title: 'حلقة المراجعة الجماعية وتثبيت سورة البقرة وآل عمران',
    surahFocus: 'سورة البقرة (من آية 100 إلى 150)',
    teacherName: 'أ. عائشة محمود العلي',
    meetingUrl: 'https://zoom.us/j/9876543210',
    maxStudents: 8,
    activeReciterId: 'st_1',
    status: 'live',
    participants: [
      {
        id: 'st_1',
        name: 'عبدالرحمن الشمري',
        role: 'student',
        isReciting: true,
        hasRaisedHand: false,
        hasCompletedTurn: false,
        score: 40,
      },
      {
        id: 'st_2',
        name: 'سارة محمد الحامد',
        role: 'student',
        isReciting: false,
        hasRaisedHand: true,
        hasCompletedTurn: false,
        score: 30,
      },
      {
        id: 'st_3',
        name: 'أحمد القحطاني',
        role: 'student',
        isReciting: false,
        hasRaisedHand: false,
        hasCompletedTurn: true,
        score: 50,
      },
      {
        id: 'st_4',
        name: 'مريم يوسف الخالد',
        role: 'student',
        isReciting: false,
        hasRaisedHand: true,
        hasCompletedTurn: false,
        score: 25,
      },
    ],
  });

  // Controls & Mic state
  const [isMicOn, setIsMicOn] = useState(false);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'أ. عائشة محمود العلي', text: 'أهلاً بكم جميعاً في حلقة المراجعة الجماعية، سنبدأ بدورة التسميع بترتيب رفع الأيدي.', time: '05:00 م' },
    { sender: 'عبدالرحمن الشمري', text: 'السلام عليكم أستاذة، جاهز لافتتاح القراءة من آية 100.', time: '05:02 م' },
  ]);
  const [newChatText, setNewChatText] = useState('');

  // Modal to create new study room (for teacher)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('حلقة التسميع التفاعلية الجماعية');
  const [newRoomSurah, setNewRoomSurah] = useState('سورة البقرة');
  const [newRoomMax, setNewRoomMax] = useState(8);

  // Teacher action: Change active reciter
  const handleSetReciter = (participantId: string) => {
    setActiveSession((prev) => ({
      ...prev,
      activeReciterId: participantId,
      participants: prev.participants.map((p) => ({
        ...p,
        isReciting: p.id === participantId,
      })),
    }));
  };

  // Teacher action: Award points to student
  const handleAwardPoints = (participantId: string, pts: number) => {
    setActiveSession((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.id === participantId
          ? { ...p, score: p.score + pts, hasCompletedTurn: true, isReciting: false }
          : p
      ),
    }));
    alert(`تم إعطاء الطالب ${pts} نقطة إتقان وإكمال دور التسميع!`);
  };

  // Student action: Raise hand
  const handleToggleRaiseHand = () => {
    setHasRaisedHand(!hasRaisedHand);
    setActiveSession((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.name === userName ? { ...p, hasRaisedHand: !hasRaisedHand } : p
      ),
    }));
  };

  // Chat send
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;

    setChatMessages([
      ...chatMessages,
      {
        sender: userName,
        text: newChatText,
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setNewChatText('');
  };

  // Teacher Create Room submit
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSession({
      id: `room_${Date.now()}`,
      title: newRoomTitle,
      surahFocus: newRoomSurah,
      teacherName: userName,
      meetingUrl: 'https://zoom.us/j/9876543210',
      maxStudents: newRoomMax,
      status: 'live',
      participants: [],
    });
    setShowCreateModal(false);
  };

  const activeReciter = activeSession.participants.find((p) => p.id === activeSession.activeReciterId);

  return (
    <div className="space-y-6">
      {/* SYNCHRONIZED COLLABORATIVE GROUP RECITATION ROOM */}
      <CollaborativeGroupRecitationRoom userRole={userRole} userName={userName} />

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-800">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30">
            <Users className="w-4 h-4 text-amber-300" />
            غرفة المراجعة الجماعية والتصحيح المباشر (Study Room)
          </div>
          <h3 className="font-extrabold text-2xl font-serif">{activeSession.title}</h3>
          <p className="text-emerald-100/80 text-xs">
            المقرر: <span className="font-bold text-amber-300">{activeSession.surahFocus}</span> | المعلمة المشرفة: {activeSession.teacherName}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={activeSession.meetingUrl}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-2xl transition-all shadow-lg flex items-center gap-2"
          >
            <Video className="w-4 h-4 text-slate-950 animate-pulse" />
            انضمام للقاعة المباشرة (Zoom)
          </a>

          {userRole === 'teacher' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl border border-emerald-600 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              إنشاء غرفة جديدة
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Live Roster & Recitation Stage (8 cols) + Group Chat & Feedback (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* RECITATION STAGE & PARTICIPANTS ROSTER (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Reciter Showcase Stage */}
          <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 p-6 rounded-3xl border-2 border-amber-300/80 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-rose-500 rounded-full animate-ping" />
                <span className="font-extrabold text-slate-900 text-sm">دور التسميع الحالي (الميكروفون مفتوح):</span>
              </div>

              {activeReciter && (
                <span className="bg-amber-400 text-slate-950 font-extrabold text-xs px-3 py-1 rounded-full shadow-sm">
                  +20 نقطة للتركيز
                </span>
              )}
            </div>

            {activeReciter ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-emerald-700 text-white rounded-2xl shadow-md font-bold text-lg relative">
                    <Volume2 className="w-8 h-8 text-amber-300 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-black text-xl text-slate-900 font-serif">{activeReciter.name}</h4>
                    <p className="text-xs text-emerald-800 font-bold mt-0.5">
                      🎧 يتلو الآن أمام المجموعة والمعلمة | رصيد النقاط: {activeReciter.score} نقطة
                    </p>
                  </div>
                </div>

                {userRole === 'teacher' && (
                  <button
                    onClick={() => handleAwardPoints(activeReciter.id, 20)}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 shrink-0"
                  >
                    <Award className="w-4 h-4 text-amber-300" />
                    منح 20 نقطة وإكمال الدور
                  </button>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs font-bold">
                لم يتم اختيار قارئ حالياً. يرجى اختيار طالب لبدء التسميع الجماعي.
              </div>
            )}
          </div>

          {/* Group Participants List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                الطلاب المشاركون بالحلقة ({activeSession.participants.length} من {activeSession.maxStudents})
              </h4>

              {userRole === 'student' && (
                <button
                  onClick={handleToggleRaiseHand}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all ${
                    hasRaisedHand
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  <Hand className="w-4 h-4" />
                  {hasRaisedHand ? 'تم رفع اليد للتسميع' : 'رفع اليد لطلب الدور'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeSession.participants.map((participant) => (
                <div
                  key={participant.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    participant.isReciting
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/30'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-slate-900 text-xs">{participant.name}</h5>
                      {participant.hasRaisedHand && (
                        <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Hand className="w-3 h-3" /> طالَب بالدور
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 font-medium">
                      {participant.isReciting
                        ? '🎧 يقرأ الآن'
                        : participant.hasCompletedTurn
                        ? '✅ أتم دور التسميع'
                        : '⏳ بانتظار الدور'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-xl">
                      {participant.score} ن
                    </span>

                    {userRole === 'teacher' && !participant.isReciting && (
                      <button
                        onClick={() => handleSetReciter(participant.id)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-xl"
                      >
                        إعطاء الدور
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* LIVE GROUP CHAT & TEACHER CORRECTIONS BOARD (4 COLS) */}
        <div className="lg:col-span-4 bg-slate-50 p-5 rounded-3xl border border-slate-200 flex flex-col justify-between max-h-[600px]">
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            <div className="border-b pb-3">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                ملاحظات المراجعة والمحادثة الجماعية
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className="bg-white p-3 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-900">{msg.sender}</span>
                    <span className="text-[10px] text-slate-400">{msg.time}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat input form */}
          <form onSubmit={handleSendChat} className="pt-3 border-t mt-3 flex items-center gap-2">
            <input
              type="text"
              value={newChatText}
              onChange={(e) => setNewChatText(e.target.value)}
              placeholder="اكتب ملاحظة أو تصحيح تجويد..."
              className="w-full text-xs p-2.5 border rounded-xl font-bold bg-white focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shrink-0"
            >
              إرسال
            </button>
          </form>

        </div>

      </div>

      {/* CREATE ROOM MODAL FOR TEACHER */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-emerald-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                إنشاء غرفة مراجعة جماعية جديدة
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان الحلقة الجماعية</label>
                <input
                  type="text"
                  required
                  value={newRoomTitle}
                  onChange={(e) => setNewRoomTitle(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">السورة والمقرر المطلـوب</label>
                <input
                  type="text"
                  required
                  value={newRoomSurah}
                  onChange={(e) => setNewRoomSurah(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">العدد الأقصى للطلاب</label>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={newRoomMax}
                  onChange={(e) => setNewRoomMax(Number(e.target.value))}
                  className="w-full p-2.5 border rounded-xl font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 text-white font-bold rounded-xl"
                >
                  بدء الغرفة الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};
