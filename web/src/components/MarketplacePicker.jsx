import { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';

const ALL_MONTREAL = 'all';

const marketplaces = [
    { fullName: ALL_MONTREAL, shortName: 'All Montreal' },
    { fullName: 'McGill University', shortName: 'McGill' },
    { fullName: 'Concordia University', shortName: 'Concordia' },
    { fullName: 'École de technologie supérieure (ÉTS)', shortName: 'ÉTS' },
    { fullName: 'Polytechnique Montréal', shortName: 'Poly' },
    { fullName: 'Université de Montréal (UdeM)', shortName: 'UdeM' },
    { fullName: 'Université du Québec à Montréal (UQAM)', shortName: 'UQAM' },
    { fullName: 'Université Laval', shortName: 'Laval' },
    { fullName: 'Université de Sherbrooke', shortName: 'Sherbrooke' },
    { fullName: 'HEC Montréal', shortName: 'HEC' },
];

export default function MarketplacePicker({ currentMarketplace, onMarketplaceChange, compact = false }) {
    const [isOpen, setIsOpen] = useState(false);

    const current = marketplaces.find(m => m.fullName === currentMarketplace);
    const displayName = current
        ? (current.fullName === ALL_MONTREAL ? 'All Montreal' : current.shortName)
        : 'UniCycle';

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center bg-unicycle-green/10 border border-unicycle-green/30 rounded-lg hover:bg-unicycle-green/20 transition-colors ${compact ? 'gap-1 px-2 py-1' : 'gap-2 px-3 py-1.5'
                    }`}
            >
                <MapPin className={`text-unicycle-green ${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
                <span className="text-xs font-semibold text-gray-800">
                    {displayName}{compact ? '' : ' Marketplace'}
                </span>
                <ChevronDown className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''} ${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />

                    {/* Menu */}
                    <div className={`absolute top-full mt-2 left-0 bg-white rounded-xl shadow-lg border border-gray-200 z-40 overflow-hidden ${compact ? 'w-56' : 'w-64'}`}>
                        <div className="p-2">
                            <p className="text-xs text-gray-400 font-medium px-3 py-1.5">Switch Marketplace</p>
                            {marketplaces.map((mp) => {
                                const isAllMontreal = mp.fullName === ALL_MONTREAL;
                                const isSelected = currentMarketplace === mp.fullName;
                                return (
                                <button
                                    key={mp.fullName}
                                    onClick={() => {
                                        onMarketplaceChange(mp.fullName);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between ${isSelected ? 'bg-unicycle-green/10' : 'hover:bg-gray-50'}`}
                                >
                                    <div>
                                        <p className={`text-sm font-medium ${isSelected ? 'text-unicycle-green' : 'text-gray-900'}`}>
                                            {isAllMontreal ? 'All Montreal' : `${mp.shortName} Marketplace`}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {isAllMontreal ? 'Browse all universities' : mp.fullName}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <div className="w-2.5 h-2.5 bg-unicycle-green rounded-full flex-shrink-0"></div>
                                    )}
                                </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}