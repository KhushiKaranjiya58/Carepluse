/**
 * Doctor Card Component
 * Displays doctor profile info for patient booking selection with favourite star
 */

import FavouriteStar from './FavouriteStar';

const DoctorCard = ({ doctor, selected, onSelect, isFavourite, onToggleFavourite }) => {
  return (
    <div
      className={`card text-left w-full transition-all hover:border-primary-500/50 relative ${
        selected ? 'border-primary-500 ring-2 ring-primary-500/30' : ''
      }`}
    >
      <div className="absolute top-3 right-3 z-10">
        <FavouriteStar isFavourite={isFavourite} onToggle={() => onToggleFavourite(doctor)} />
      </div>

      <button type="button" onClick={() => onSelect(doctor)} className="w-full text-left">
        <div className="flex gap-4 pr-8">
          <img
            src={doctor.profilePhoto || 'https://i.pravatar.cc/150?img=68'}
            alt={doctor.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-dark-border"
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-semibold text-slate-100 truncate">{doctor.name}</h4>
              <span className="text-yellow-400 text-sm whitespace-nowrap">
                ★ {doctor.rating?.toFixed(1) || '4.5'}
              </span>
            </div>
            <p className="text-primary-400 text-sm font-medium">{doctor.specialization}</p>
            <p className="text-slate-400 text-xs mt-1">{doctor.qualification}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
              <span>{doctor.experience} yrs exp.</span>
              <span className="text-green-400 font-medium">${doctor.consultationFee}</span>
            </div>
            {doctor.bio && (
              <p className="text-slate-500 text-xs mt-2 line-clamp-2">{doctor.bio}</p>
            )}
          </div>
        </div>
        {selected && (
          <p className="text-primary-400 text-xs mt-3 font-medium">✓ Selected</p>
        )}
      </button>
    </div>
  );
};

export default DoctorCard;
