import { useState, useEffect } from 'react';
import statisticsService from '../services/statisticsService';

// Cache for statistics to avoid multiple API calls
let statisticsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const useStatistics = () => {
  const [statistics, setStatistics] = useState({
    activeUsers: { value: 850, formatted: '850', label: 'Active Users' },
    totalNotes: { value: 15000, formatted: '15.0K', label: 'Notes Created' },
    totalSharedLinks: { value: 3500, formatted: '3.5K', label: 'Links Shared' },
    userRating: { value: 4.8, formatted: '4.8', label: 'User Rating' }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        // Check if we have valid cached data
        const now = Date.now();
        if (statisticsCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
          setStatistics(statisticsCache);
          setLoading(false);
          return;
        }

        // Load fresh data
        const stats = await statisticsService.getFormattedStatistics();
        
        // Update cache
        statisticsCache = stats;
        cacheTimestamp = now;
        
        setStatistics(stats);
        setError(null);
      } catch (err) {
        setError(err);
        // Keep fallback values if there's an error
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, []);

  const refreshStatistics = async () => {
    setLoading(true);
    try {
      const stats = await statisticsService.getFormattedStatistics();
      
      // Update cache
      statisticsCache = stats;
      cacheTimestamp = Date.now();
      
      setStatistics(stats);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    statistics,
    loading,
    error,
    refreshStatistics
  };
};

export default useStatistics;
