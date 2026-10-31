import React, { useState, useEffect } from 'react';
import { X, Upload, Sparkles, Sprout, CheckCircle2 } from 'lucide-react';
import { useRegionalContainerStore } from '@/store/regionalContainerStore';
import { createPostApi, fetchYieldsApi, uploadMediaFileApi } from '@/api';
import { Yield } from '@/types';

export const CreatePostModal: React.FC<{ onPostCreated?: () => void }> = ({ onPostCreated }) => {
  const { isCreatePostModalOpen, setCreatePostModalOpen } = useRegionalContainerStore();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState(
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=900&auto=format&fit=crop&q=80'
  );
  const [linkedYieldId, setLinkedYieldId] = useState('');
  const [yields, setYields] = useState<Yield[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isCreatePostModalOpen) {
      fetchYieldsApi().then((data) => {
        setYields(data);
        if (data.length > 0 && !linkedYieldId) {
          setLinkedYieldId(data[0].id);
        }
      });
    }
  }, [isCreatePostModalOpen]);

  if (!isCreatePostModalOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      setError('');
      const uploaded = await uploadMediaFileApi(file);
      setMediaUrl(uploaded.url);
    } catch (err: any) {
      // Fallback local object URL preview if backend upload requires auth or isn't running
      setMediaUrl(URL.createObjectURL(file));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please describe your harvest story.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await createPostApi({
        content: content.trim(),
        mediaUrl,
        linkedYieldId: linkedYieldId || undefined,
      });
      setContent('');
      setCreatePostModalOpen(false);
      if (onPostCreated) onPostCreated();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Sign in with a Farmer account to publish live stories to the backend.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[#241A12]/60 backdrop-blur-xs"
        onClick={() => setCreatePostModalOpen(false)}
      />

      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl border border-[#CCEBD5] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-[#EEF8F1] border-b border-[#CCEBD5]">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#4E8B3F]" />
            <h3 className="font-display-italic text-lg text-[#173A20] font-semibold">
              Publish AgroFeed Harvest Story
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setCreatePostModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white border border-[#CCEBD5] flex items-center justify-center text-[#241A12] hover:bg-[#E1F3E7] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[#FDF3F1] border border-[#B54A34]/30 text-xs text-[#B54A34] font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#5C5245] mb-1.5">
              Harvest Story Caption
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share live field updates, harvest quality, or wholesale crate availability..."
              className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2.5 text-sm text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5C5245] mb-1.5">
              Photo or Harvest Video URL (or Upload File)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2 text-xs text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
              />
              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#CCEBD5] text-xs font-semibold text-[#173A20] hover:bg-[#EEF8F1] cursor-pointer shrink-0">
                <Upload size={14} className="text-[#4E8B3F]" />
                <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5C5245] mb-1.5">
              Link Shoppable Harvest Lot (1-Tap Buy Overlay)
            </label>
            <div className="relative">
              <select
                value={linkedYieldId}
                onChange={(e) => setLinkedYieldId(e.target.value)}
                className="w-full rounded-xl bg-[#EEF8F1] border border-[#CCEBD5] px-3.5 py-2.5 text-sm text-[#241A12] focus:outline-none focus:border-[#4E8B3F]"
              >
                <option value="">— No linked product —</option>
                {yields.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.title} ({y.price?.toLocaleString()} FCFA / {y.unit})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreatePostModalOpen(false)}
              className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#5C5245] hover:bg-[#EEF8F1] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <CheckCircle2 size={15} />
              <span>{submitting ? 'Publishing...' : 'Publish to AgroFeed'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;

