import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Award, Warehouse } from 'lucide-react';
import { Farm } from '@/types';
import { resolveMediaUrl } from '@/utils/media';

export interface FarmCardProps {
  farm: Farm | any;
  variant?: 'marketplace' | 'profile';
  isOwner?: boolean;
  onClick?: () => void;
}

export const FarmCard: React.FC<FarmCardProps> = ({
  farm,
  variant = 'marketplace',
  isOwner = false,
  onClick,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (isOwner) {
      navigate(`/farmer/manage?farmId=${farm.id}`);
    } else {
      navigate(`/farm/${farm.slug || farm.id}`);
    }
  };

  const coverImg =
    resolveMediaUrl(farm.coverPhoto || farm.avatarPhoto) ||
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800';

  const tier = (
    farm.tier ||
    farm.farmerProfile?.tier ||
    farm.farmerProfile?.creditTier ||
    'BRONZE'
  ).toUpperCase();

  const tierColor =
    tier === 'GOLD'
      ? 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]'
      : tier === 'SILVER'
      ? 'bg-[#F1F5F9] text-[#334155] border-[#94A3B8]'
      : 'bg-[#FFEDD5] text-[#9A3412] border-[#F97316]';

  const primaryProduceTags: string[] = Array.isArray(farm.primaryProduce)
    ? farm.primaryProduce
    : typeof farm.primaryProduce === 'string'
    ? farm.primaryProduce.split(',').map((s: string) => s.trim())
    : [];

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl border border-[#CCEBD5] hover:border-[#4E8B3F] overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col group"
    >
      {/* Cover Media Container */}
      <div className="h-40 bg-[#EEF8F1] relative overflow-hidden">
        <img
          src={coverImg}
          alt={farm.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top-Left: Category & Hectares Badge */}
        <span className="absolute top-3 left-3 bg-[#EEF8F1]/95 text-[#173A20] border border-[#CCEBD5] text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs shadow-2xs">
          {farm.category || 'CROPS'} • {farm.sizeHectares || 2.5} Ha
        </span>

        {/* Top-Right: Credibility Tier Badge (Bronze / Silver / Gold) */}
        <span
          className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-xs flex items-center gap-1 shadow-2xs ${tierColor}`}
        >
          <Award size={11} className="shrink-0" />
          <span>{tier} PRODUCER</span>
        </span>
      </div>

      {/* Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-bold text-base text-[#173A20] leading-snug group-hover:text-[#4E8B3F] transition truncate">
              {farm.name}
            </h4>
            <span className="inline-flex items-center gap-1 text-xs font-mono-num font-bold text-[#173A20] shrink-0">
              <Star size={13} className="fill-[#4E8B3F] text-[#4E8B3F]" />
              {farm.rating ? Number(farm.rating).toFixed(1) : '5.0'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-[#5C5245]">
            <MapPin size={13} className="text-[#4E8B3F] shrink-0" />
            <span className="truncate">
              {farm.location ? `${farm.location}, ` : ''}{farm.city || 'Cameroon'}, {farm.region || ''}
            </span>
          </div>

          {farm.description && (
            <p className="text-xs text-[#5C5245] line-clamp-2 leading-relaxed">
              {farm.description}
            </p>
          )}

          {/* Produce Glance Specialties */}
          {primaryProduceTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pt-1">
              {primaryProduceTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold bg-[#EEF8F1] text-[#4E8B3F] border border-[#CCEBD5] px-2 py-0.5 rounded-md"
                >
                  {tag}
                </span>
              ))}
              {primaryProduceTags.length > 3 && (
                <span className="text-[10px] font-semibold text-[#5C5245]">
                  +{primaryProduceTags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Action Strip */}
        <div className="pt-2 border-t border-[#EEF8F1] flex items-center justify-between text-xs text-[#5C5245]">
          <span className="font-semibold text-[11px]">
            {farm.parcels?.length ? `${farm.parcels.length} Site(s)` : 'Direct AgroFarm'}
          </span>
          <span className="text-[#4E8B3F] font-bold group-hover:underline">
            {isOwner ? 'Manage Farm →' : 'View Storefront →'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FarmCard;

