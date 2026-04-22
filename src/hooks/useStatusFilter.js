import { useState, useCallback, useMemo } from 'react';
import { updateFilterCounts, filterData } from '../utils/filterConfigs';

/**
 * Custom hook for managing StatusFilter state and logic
 * @param {Array} initialFilters - Initial filter configuration
 * @param {Array} data - Data to filter
 * @param {string} statusField - Field name to check status
 * @param {string} defaultFilter - Default selected filter key
 */
export const useStatusFilter = (
  initialFilters,
  data = [],
  statusField = 'status',
  defaultFilter = 'all'
) => {
  const [selectedFilter, setSelectedFilter] = useState(defaultFilter);

  // Update filters with counts
  const filtersWithCounts = useMemo(() => {
    return updateFilterCounts(initialFilters, data, statusField);
  }, [initialFilters, data, statusField]);

  // Filter data based on selected filter
  const filteredData = useMemo(() => {
    return filterData(data, selectedFilter, statusField);
  }, [data, selectedFilter, statusField]);

  // Handle filter selection
  const handleFilterSelect = useCallback((filterKey) => {
    setSelectedFilter(filterKey);
  }, []);

  // Reset to default filter
  const resetFilter = useCallback(() => {
    setSelectedFilter(defaultFilter);
  }, [defaultFilter]);

  // Get active filter info
  const activeFilter = useMemo(() => {
    return filtersWithCounts.find(filter => filter.key === selectedFilter);
  }, [filtersWithCounts, selectedFilter]);

  // Get filter statistics
  const filterStats = useMemo(() => {
    const total = data.length;
    const activeCount = filteredData.length;
    const hasActiveFilter = selectedFilter !== 'all';
    
    return {
      total,
      activeCount,
      hasActiveFilter,
      percentage: total > 0 ? Math.round((activeCount / total) * 100) : 0,
    };
  }, [data, filteredData, selectedFilter]);

  return {
    selectedFilter,
    filters: filtersWithCounts,
    filteredData,
    activeFilter,
    filterStats,
    handleFilterSelect,
    resetFilter,
    setSelectedFilter,
  };
};

export default useStatusFilter;
