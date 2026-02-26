import React from 'react';

interface FilterBarProps {
    filters: string[];
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    labelMap?: Record<string, string>;
}

const FilterBar: React.FC<FilterBarProps> = ({
    filters,
    activeFilter,
    onFilterChange,
    labelMap,
}) => {
    return (
        <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => onFilterChange(filter)}
                        className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${activeFilter === filter
                                ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                                : 'glass-card text-gray-600 hover:bg-white/80'
                            }`}
                    >
                        {labelMap?.[filter] ?? filter}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FilterBar;
