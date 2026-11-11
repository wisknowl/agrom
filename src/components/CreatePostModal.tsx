import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useRegionalContainerStore } from '@/store/regionalContainerStore';
import { createPostApi, fetchFarmByIdApi, fetchMyFarmsApi } from '@/api';
import { AgromImageUploader } from '@/components/AgromImageUploader';
import { isVideoMedia } from '@/utils/media';
import { Yield } from '@/types';

export const CreatePostModal: React.FC<{ onPostCreated?: () => void }> = ({ onPostCreated }) => {
  const {
    isCreatePostModalOpen,
    createPostFarmId,
    setCreatePostModalOpen,
    notifyPostCreated,
  } = useRegionalContainerStore();

  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isVideo, setIsVideo] = useState(false);
  const [linkedYieldId, setLinkedYieldId] = useState('');
  const [yields, setYields] = useState<Yield[]>([]);
  const [farmName, setFarmName] = useState<string>('');
  const [loadingYields, setLoadingYields] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isCreatePostModalOpen) return;

    let cancelled = false;
    setError('');
    setLinkedYieldId('');

    const loadScopedProduce = async () => {
      setLoadingYields(true);
      try {
        if (createPostFarmId) {
          const farm = await fetchFarmByIdApi(createPostFarmId);
          if (cancelled) return;
          setFarmName(farm?.name || '');
          const farmYields: Yield[] = (farm?.yields || []).map((y: any) => ({
            ...y,
            price: Number(y.price !== undefined ? y.price : y.pricePerUnit || 0),
          }));
          setYields(farmYields);
        } else {
          setFarmName('');
          const myFarms = await fetchMyFarmsApi();
          if (cancelled) return;
          const ownYields: Yield[] = myFarms.flatMap((f: any) =>
            (f.yields || []).map((y: any) => ({
              ...y,
              farmId: y.farmId || f.id,
              price: Number(y.price !== undefined ? y.price : y.pricePerUnit || 0),
            }))
          );
          setYields(ownYields);
        }
      } catch {
        if (!cancelled) setYields([]);
      } finally {
        if (!cancelled) setLoadingYields(false);
      }
    };

    loadScopedProduce();
    return () => {
      cancelled = true;
    };
  }, [isCreatePostModalOpen, createPostFarmId]);

  if (!isCreatePostModalOpen) return null;

  const resetAndClose = () => {
    setError('');
    setCreatePostModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl) {
      setError('Please upload a harvest photo or video from your device.');
      return;
    }
    if (!content.trim()) {
      setError('Please write a caption for your post.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      const selectedYield = yields.find((y) => y.id === linkedYieldId);
      const targetFarmId = createPostFarmId || selectedYield?.farmId || undefined;

      await createPostApi({
        content: content.trim(),
        mediaUrl,
        isVideo: isVideo || isVideoMedia(mediaUrl),
        linkedYieldId: linkedYieldId || undefined,
        farmId: targetFarmId,
      });

      setContent('');
      setMediaUrl('');
      setIsVideo(false);
      setLinkedYieldId('');
      notifyPostCreated();
      setCreatePostModalOpen(false);
      if (onPostCreated) onPostCreated();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Sign in with a Farmer account to publish live posts.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[#241A12]/60 backdrop-blur-xs"
        onClick={resetAndClose}
      />

      <div className="relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-3xl border border-[#CCEBD5] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 bg-[#EEF8F1] border-b border-[#CCEBD5] sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[#4E8B3F]" />
              <h3 className="font-display-italic text-lg text-[#173A20] font-semibold">
                Publish Farm Post
              </h3>
            </div>
            {farmName && (
              <p className="text-[11px] font-semibold text-[#4E8B3F] mt-0.5">
                Posting to {farmName}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={resetAndClose}
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

          {/* Upload-Only Media Dropzone (matches Add Produce Form AgromImageUploader style) */}
          <AgromImageUploader
            label="Post Photo or Video"
            required
            singleBanner
            accept="image/*,video/*"
            aspectRatio="video"
            title="Upload Harvest Photo or Video"
            subtitle="Click to choose an image or reel video from your device"
            images={mediaUrl ? [mediaUrl] : []}
            onChange={(imgs) => {
              const nextUrl = imgs[0] || '';
              setMediaUrl(nextUrl);
              if (!nextUrl) setIsVideo(false);
            }}
            onMediaUploaded={({ isVideo: vid }) => setIsVideo(vid)}
          />

          <div>
            <label className="block text-xs font-semibold text-[#5C5245] mb-1.5">
              Post Caption *
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share live field updates, harvest quality, or crate availability..."
              className="w-full rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-2.5 text-sm text-[#173A20] placeholder-[#5C5245]/60 focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5C5245] mb-1.5">
              Attach Produce from {farmName || 'Your Farm'} (1-Tap Buy Overlay)
            </label>
            <select
              value={linkedYieldId}
              onChange={(e) => setLinkedYieldId(e.target.value)}
              disabled={loadingYields}
              className="w-full rounded-2xl bg-[#EEF8F1] border border-[#CCEBD5] px-4 py-2.5 text-sm text-[#173A20] focus:outline-none focus:border-[#4E8B3F] focus:ring-2 focus:ring-[#4E8B3F]/20 transition"
            >
              <option value="">
                {loadingYields
                  ? 'Loading farm produce...'
                  : yields.length === 0
                  ? '— No produce listed on this farm yet —'
                  : '— Optional: Attach a produce item —'}
              </option>
              {yields.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.title} ({Number(y.price || y.pricePerUnit || 0).toLocaleString()} FCFA / {y.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={resetAndClose}
              className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#5C5245] hover:bg-[#EEF8F1] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] disabled:opacity-60 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <CheckCircle2 size={15} />
              <span>{submitting ? 'Publishing...' : 'Publish Post'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;

