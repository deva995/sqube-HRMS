import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart,
  Sparkles,
  Megaphone,
  Award,
  Pin,
  MessageSquare,
  Plus,
  Send,
  Users,
  Smile,
  Zap,
  TrendingUp,
  Share2,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { KpiCard } from '../common/KpiCard';
import { Modal } from '../common/Modal';
import { EngagementAnnouncement, EngagementRecognition } from '../../types';
import { engagementApi } from '../../services/engagementApi';
import confetti from 'canvas-confetti';

export const EngagementModuleView: React.FC = () => {
  const { currentUserRole, currentUserPersona, employees, showToast } = useHrms();

  const [announcements, setAnnouncements] = useState<EngagementAnnouncement[]>([]);
  const [recognitions, setRecognitions] = useState<EngagementRecognition[]>([]);
  const [activeTab, setActiveTab] = useState<'announcements' | 'kudos' | 'pulse'>('announcements');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isKudosModalOpen, setIsKudosModalOpen] = useState(false);

  // Announcement Form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState('General');
  const [annPinned, setAnnPinned] = useState(false);

  // Kudos Form
  const [kudosRecipientId, setKudosRecipientId] = useState('');
  const [kudosBadge, setKudosBadge] = useState('Team Player');
  const [kudosMessage, setKudosMessage] = useState('');

  const isHrOrAdmin = ['Super Admin', 'Admin', 'HR Manager'].includes(currentUserRole);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [annList, recogList] = await Promise.all([
        engagementApi.getAnnouncements(),
        engagementApi.getRecognitions(),
      ]);
      setAnnouncements(annList);
      setRecognitions(recogList);
    } catch (err: any) {
      showToast({ message: 'Failed to load engagement feed: ' + err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLikeAnnouncement = async (id: string) => {
    try {
      const res = await engagementApi.likeAnnouncement(id);
      setAnnouncements(announcements.map((a) => (a.id === id ? { ...a, likesCount: res.likesCount } : a)));
      confetti({ particleCount: 20, spread: 40, origin: { y: 0.7 } });
    } catch (err: any) {
      showToast({ message: 'Error liking post: ' + err.message, type: 'error' });
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      showToast({ message: 'Please enter title and content.', type: 'error' });
      return;
    }

    try {
      const created = await engagementApi.createAnnouncement({
        title: annTitle,
        content: annContent,
        category: annCategory,
        pinned: annPinned,
      });

      setAnnouncements([created, ...announcements]);
      setIsAnnouncementModalOpen(false);
      setAnnTitle('');
      setAnnContent('');
      showToast({ message: 'Announcement broadcasted to all employees.', type: 'success' });
    } catch (err: any) {
      showToast({ message: 'Failed to post announcement: ' + err.message, type: 'error' });
    }
  };

  const handleSendKudos = async (e: React.FormEvent) => {
    e.preventDefault();
    const recipient = employees.find((emp) => emp.id === kudosRecipientId);
    if (!recipient || !kudosMessage.trim()) {
      showToast({ message: 'Please select a colleague and write a recognition message.', type: 'error' });
      return;
    }

    try {
      const created = await engagementApi.createRecognition({
        recipientId: recipient.id,
        recipientName: `${recipient.firstName} ${recipient.lastName}`.trim(),
        recipientAvatar: recipient.avatar,
        badge: kudosBadge,
        message: kudosMessage,
      });

      setRecognitions([created, ...recognitions]);
      setIsKudosModalOpen(false);
      setKudosMessage('');
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
      showToast({ message: `Kudos sent to ${recipient.firstName}!`, type: 'success' });
    } catch (err: any) {
      showToast({ message: 'Failed to send recognition: ' + err.message, type: 'error' });
    }
  };

  const badges = [
    { name: 'Team Player', icon: '🤝', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'Innovation Hero', icon: '🚀', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { name: 'Customer Champion', icon: '⭐', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { name: 'Star Performer', icon: '🌟', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Helping Hand', icon: '❤️', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-indigo-600" />
            Employee Engagement & Culture
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Company-wide broadcasts, peer recognition kudos, team celebrations, and employee satisfaction pulse.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsKudosModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <Award className="w-4 h-4" />
            Give Kudos
          </button>
          {isHrOrAdmin && (
            <button
              onClick={() => setIsAnnouncementModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-95"
            >
              <Megaphone className="w-4 h-4" />
              Post Announcement
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Announcements"
          value={announcements.length}
          subtitle="Organization-wide updates"
          icon={<Megaphone className="w-5 h-5 text-indigo-600" />}
          gradient="from-indigo-500/10 to-blue-500/10"
        />
        <KpiCard
          title="Peer Recognitions"
          value={recognitions.length}
          subtitle="Kudos shared this month"
          icon={<Award className="w-5 h-5 text-amber-600" />}
          gradient="from-amber-500/10 to-orange-500/10"
        />
        <KpiCard
          title="Culture Happiness Index"
          value="94%"
          subtitle="Positive team feedback score"
          icon={<Smile className="w-5 h-5 text-emerald-600" />}
          gradient="from-emerald-500/10 to-teal-500/10"
        />
        <KpiCard
          title="Participation Rate"
          value="88%"
          subtitle="395 active participants"
          icon={<Users className="w-5 h-5 text-purple-600" />}
          gradient="from-purple-500/10 to-indigo-500/10"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'announcements'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Announcements ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('kudos')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'kudos'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Kudos & Peer Recognition ({recognitions.length})
        </button>
        <button
          onClick={() => setActiveTab('pulse')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'pulse'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Culture & Feedback Pulse
        </button>
      </div>

      {/* Tab 1: Announcements */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="bg-white/80 rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
              <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-50" />
              No announcements published yet.
            </div>
          ) : (
            announcements.map((ann) => (
              <div
                key={ann.id}
                className={`bg-white/80 backdrop-blur-xl border rounded-2xl p-6 shadow-sm transition-all ${
                  ann.pinned ? 'border-indigo-300 ring-2 ring-indigo-500/10 bg-indigo-50/20' : 'border-slate-200/80'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                      {ann.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                        {ann.authorName}
                        {ann.pinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                            <Pin className="w-3 h-3" /> Pinned Post
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(ann.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {ann.category}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {ann.category}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
                  <p className="text-sm text-slate-600 mt-2 whitespace-pre-line leading-relaxed">{ann.content}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleLikeAnnouncement(ann.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium text-xs transition-colors"
                  >
                    <Heart className="w-4 h-4 fill-rose-500" />
                    <span>{ann.likesCount} Likes</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Kudos & Peer Recognitions */}
      {activeTab === 'kudos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recognitions.length === 0 ? (
            <div className="col-span-2 bg-white/80 rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
              <Award className="w-10 h-10 mx-auto mb-2 opacity-50" />
              No kudos given yet. Be the first to recognize a colleague!
            </div>
          ) : (
            recognitions.map((rec) => (
              <div
                key={rec.id}
                className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="font-bold text-slate-900">{rec.senderName}</span> recognized{' '}
                    <span className="font-bold text-indigo-600">{rec.recipientName}</span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    {rec.badge}
                  </span>
                </div>

                <p className="text-sm text-slate-700 bg-slate-50/80 rounded-xl p-3.5 italic border border-slate-100">
                  "{rec.message}"
                </p>

                <div className="text-[11px] text-slate-400 text-right">
                  {new Date(rec.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Pulse */}
      {activeTab === 'pulse' && (
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900">Q3 Organizational Culture & Satisfaction Pulse</h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Team Collaboration & Psychological Safety</span>
                <span className="text-indigo-600 font-bold">96% Positive</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '96%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Work-Life Balance & Flexibility</span>
                <span className="text-indigo-600 font-bold">92% Positive</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Leadership Clarity & Transparency</span>
                <span className="text-indigo-600 font-bold">91% Positive</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '91%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Announcement Modal */}
      <Modal isOpen={isAnnouncementModalOpen} onClose={() => setIsAnnouncementModalOpen(false)} title="Broadcast Announcement">
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              placeholder="e.g. Annual Company Offsite 2026 Announced"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={annCategory}
                onChange={(e) => setAnnCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="General">General News</option>
                <option value="Townhall">Townhall</option>
                <option value="Milestone">Company Milestone</option>
                <option value="Policy">Policy Update</option>
                <option value="Celebration">Celebration</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={annPinned}
                  onChange={(e) => setAnnPinned(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Pin to top of feed
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Body</label>
            <textarea
              rows={4}
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              placeholder="Write your company announcement message..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAnnouncementModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95"
            >
              Publish Post
            </button>
          </div>
        </form>
      </Modal>

      {/* Give Kudos Modal */}
      <Modal isOpen={isKudosModalOpen} onClose={() => setIsKudosModalOpen(false)} title="Recognize a Colleague (Give Kudos)">
        <form onSubmit={handleSendKudos} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Colleague</label>
            <select
              value={kudosRecipientId}
              onChange={(e) => setKudosRecipientId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            >
              <option value="">-- Choose a team member --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.department} - {emp.designation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Badge</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {badges.map((b) => (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => setKudosBadge(b.name)}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center gap-2 transition-all ${
                    kudosBadge === b.name
                      ? 'border-amber-400 bg-amber-50/80 text-amber-900 ring-2 ring-amber-400/20 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-base">{b.icon}</span>
                  <span>{b.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Recognition Note</label>
            <textarea
              rows={3}
              value={kudosMessage}
              onChange={(e) => setKudosMessage(e.target.value)}
              placeholder="What makes their contribution special? Express your appreciation..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsKudosModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95"
            >
              Send Kudos ✨
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
