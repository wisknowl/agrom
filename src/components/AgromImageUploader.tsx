import React, { useRef, useState } from 'react';
import { Camera, Plus, X, Upload, Film } from 'lucide-react';
import { uploadMediaFileApi } from '@/api';
import { resolveMediaUrl, isVideoMedia } from '@/utils/media';

export interface AgromImageUploaderProps {
  label?: string;
  required?: boolean;
  title?: string;
  subtitle?: string;
  images: string[];
  maxImages?: number;
  multiple?: boolean;
  accept?: string;
  aspectRatio?: 'video' | 'wide' | 'square';
  singleBanner?: boolean;
  onChange: (images: string[]) => void;
  onMediaUploaded?: (media: { url: string; isVideo: boolean }) => void;
  helperText?: string;
}

export const AgromImageUploader: React.FC<AgromImageUploaderProps> = ({
  label = 'Harvest Photos',
  required = false,
  title = 'Upload Real Harvest Photos',
  subtitle = 'Click to choose clear field, crate or crop photos (Multiple allowed)',
  images,
  maxImages = 6,
  multiple = true,
  accept = 'image/*',
  aspectRatio = 'square',
  singleBanner = false,
  onChange,
  onMediaUploaded,
  helperText,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUploadedIsVideo, setLastUploadedIsVideo] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      if (singleBanner) {
        const file = files[0];
        const res = await uploadMediaFileApi(file);
        const url = res?.url;
        const vid = Boolean(res?.isVideo || file.type?.startsWith('video/') || isVideoMedia(url));
        if (url) {
          setLastUploadedIsVideo(vid);
          onChange([url]);
          onMediaUploaded?.({ url, isVideo: vid });
        }
      } else {
        const filesToUpload = Array.from(files).slice(0, maxImages - images.length);
        const uploadedUrls: string[] = [];
        for (const file of filesToUpload) {
          const res = await uploadMediaFileApi(file);
          const url = res?.url;
          if (url) {
            uploadedUrls.push(url);
          }
        }
        onChange([...images, ...uploadedUrls]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const next = [...images];
    next.splice(index, 1);
    setLastUploadedIsVideo(false);
    onChange(next);
  };

  const aspectClass =
    aspectRatio === 'video'
      ? 'aspect-[16/9]'
      : aspectRatio === 'wide'
      ? 'aspect-[21/9]'
      : 'aspect-square';

  const allowsVideo = accept.includes('video');

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-[#5C5245]">
          {label} {required && <span className="text-[#dc2626]">*</span>}
        </label>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={!singleBanner && multiple}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Single Banner Mode */}
      {singleBanner ? (
        <div>
          {images[0] ? (
            <div className={`relative w-full ${aspectClass} rounded-2xl overflow-hidden border border-[#CCEBD5] bg-[#173A20] group`}>
              {isVideoMedia(images[0], lastUploadedIsVideo) ? (
                <video
                  src={resolveMediaUrl(images[0])}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              ) : (
                <img
                  src={resolveMediaUrl(images[0])}
                  alt="Media preview"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/30 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3.5 py-1.5 rounded-full bg-white text-[#173A20] text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#EEF8F1] transition shadow-md cursor-pointer"
                >
                  {allowsVideo ? (
                    <Upload size={14} className="text-[#4E8B3F]" />
                  ) : (
                    <Camera size={14} className="text-[#4E8B3F]" />
                  )}
                  <span>{uploading ? 'Uploading...' : allowsVideo ? 'Change Media' : 'Change Photo'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(0)}
                  disabled={uploading}
                  className="p-1.5 rounded-full bg-white text-[#dc2626] hover:bg-[#FDF3F1] transition shadow-md cursor-pointer"
                  title="Remove media"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-8 px-4 rounded-2xl border-2 border-dashed border-[#CCEBD5] hover:border-[#4E8B3F] bg-[#EEF8F1] hover:bg-[#E5F5E9] flex flex-col items-center justify-center cursor-pointer transition text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#CCEBD5] group-hover:border-[#4E8B3F] flex items-center justify-center text-[#4E8B3F] mb-2 shadow-2xs">
                {allowsVideo ? <Film size={22} /> : <Camera size={22} />}
              </div>
              <div className="text-xs font-bold text-[#173A20]">{title}</div>
              <div className="text-[11px] text-[#5C5245] mt-0.5">{subtitle}</div>
              {uploading && (
                <div className="mt-2 text-xs font-semibold text-[#4E8B3F] flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 border-2 border-[#4E8B3F] border-t-transparent rounded-full animate-spin" />
                  <span>Uploading media...</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Multi-Image Gallery Mode */
        <div>
          {images.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <div
                    key={`${img}-${idx}`}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-[#CCEBD5] group shadow-2xs"
                  >
                    <img
                      src={resolveMediaUrl(img)}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(idx);
                      }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-[#B54A34] text-white flex items-center justify-center transition cursor-pointer shadow-xs"
                      title="Remove this photo"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}

                {images.length < maxImages && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="aspect-square rounded-2xl border-2 border-dashed border-[#CCEBD5] hover:border-[#4E8B3F] bg-[#EEF8F1] hover:bg-[#E5F5E9] flex flex-col items-center justify-center cursor-pointer transition text-[#4E8B3F] group disabled:opacity-50"
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-[#CCEBD5] group-hover:border-[#4E8B3F] flex items-center justify-center mb-1">
                      <Plus size={16} />
                    </div>
                    <span className="text-[10px] font-bold">Add Photo</span>
                  </button>
                )}
              </div>

              {uploading && (
                <div className="text-xs font-semibold text-[#4E8B3F] flex items-center gap-1.5 pt-1">
                  <div className="w-3.5 h-3.5 border-2 border-[#4E8B3F] border-t-transparent rounded-full animate-spin" />
                  <span>Uploading photo(s)...</span>
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-6 px-4 rounded-2xl border-2 border-dashed border-[#CCEBD5] hover:border-[#4E8B3F] bg-[#EEF8F1] hover:bg-[#E5F5E9] flex flex-col items-center justify-center cursor-pointer transition text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#CCEBD5] group-hover:border-[#4E8B3F] flex items-center justify-center text-[#4E8B3F] mb-2 shadow-2xs">
                <Camera size={22} />
              </div>
              <div className="text-xs font-bold text-[#173A20]">{title}</div>
              <div className="text-[11px] text-[#5C5245] mt-0.5">{subtitle}</div>
              {uploading && (
                <div className="mt-2 text-xs font-semibold text-[#4E8B3F] flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 border-2 border-[#4E8B3F] border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs font-medium text-[#dc2626] pt-1">{error}</p>}
      {helperText && <p className="text-[11px] text-[#5C5245] pt-0.5">{helperText}</p>}
    </div>
  );
};
