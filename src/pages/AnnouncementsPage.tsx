import { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { deleteAnnouncement, fetchAnnouncements, postAnnouncement } from '../store/hrmSlice';

export default function AnnouncementsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { announcements } = useAppSelector((s) => s.hrm);

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showPostForm, setShowPostForm] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'Policy' | 'Company News' | 'HR Update' | 'Events'>(
    'HR Update'
  );
  const [priority, setPriority] = useState<'Standard' | 'Important' | 'Urgent'>('Standard');
  const [targetAudience, setTargetAudience] = useState<'All' | 'Employees' | 'Managers'>('All');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAnnouncements(categoryFilter === 'All' ? undefined : categoryFilter));
  }, [dispatch, categoryFilter]);

  if (!user) return null;

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await dispatch(
      postAnnouncement({ title, content, category, priority, targetAudience })
    );
    setSubmitting(false);
    if (postAnnouncement.fulfilled.match(res)) {
      setShowPostForm(false);
      setTitle('');
      setContent('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Organization Announcements
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Official HR policy updates, benefits enrollment notices, and company events.
          </p>
        </div>

        {user.role === 'hr' && (
          <button
            type="button"
            onClick={() => setShowPostForm((p) => !p)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap self-start"
          >
            <Plus className="w-4 h-4" />
            <span>{showPostForm ? 'Close Composer' : 'Post Announcement'}</span>
          </button>
        )}
      </div>

      {showPostForm && user.role === 'hr' && (
        <form
          onSubmit={handlePublish}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <h2 className="font-display text-base font-semibold text-slate-900">
            Broadcast New Announcement
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Headline</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual Performance Review Schedule"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as 'Policy' | 'Company News' | 'HR Update' | 'Events')
                }
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
              >
                <option value="HR Update">HR Update</option>
                <option value="Policy">Policy</option>
                <option value="Company News">Company News</option>
                <option value="Events">Events</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as 'Standard' | 'Important' | 'Urgent')
                }
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
              >
                <option value="Standard">Standard</option>
                <option value="Important">Important</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Audience</label>
              <select
                value={targetAudience}
                onChange={(e) =>
                  setTargetAudience(e.target.value as 'All' | 'Employees' | 'Managers')
                }
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
              >
                <option value="All">All Personnel</option>
                <option value="Employees">Employees</option>
                <option value="Managers">Managers Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Message Body</label>
            <textarea
              rows={3}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write clear, actionable details for the team..."
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowPostForm(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg whitespace-nowrap"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>{submitting ? 'Publishing...' : 'Publish & Notify'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg w-fit">
        {['All', 'HR Update', 'Policy', 'Company News', 'Events'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Announcements Feed */}
      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
        {announcements.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No announcements published in this category.
          </div>
        ) : (
          announcements.map((ann) => (
            <article key={ann._id} className="p-6 flex items-start justify-between gap-4">
              <div className="max-w-3xl">
                <p className="text-xs text-slate-500">
                  {ann.category} · {ann.priority} Priority · Audience: {ann.targetAudience} ·{' '}
                  <span className="font-mono tabular-nums">{ann.publishedAt.slice(0, 10)}</span>
                </p>
                <h2 className="font-display text-lg font-semibold text-slate-900 mt-1.5">
                  {ann.title}
                </h2>
                <p className="text-sm text-slate-700 mt-2 leading-relaxed">{ann.content}</p>
                <p className="text-xs text-slate-500 mt-3">Published by {ann.authorName}</p>
              </div>

              {user.role === 'hr' && (
                <button
                  type="button"
                  onClick={() => dispatch(deleteAnnouncement(ann._id))}
                  title="Remove announcement"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
