/**
 * Star/Favourite Button Component
 * Toggle favourite status for a doctor
 */

const FavouriteStar = ({ isFavourite, onToggle, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'text-lg p-1' : 'text-xl p-1.5';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`${sizeClasses} rounded-full hover:bg-dark-surface transition-colors leading-none`}
      title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
      aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
    >
      {isFavourite ? (
        <span className="text-yellow-400">★</span>
      ) : (
        <span className="text-slate-500 hover:text-yellow-400">☆</span>
      )}
    </button>
  );
};

export default FavouriteStar;
