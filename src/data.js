export const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

export const value_converter = (value) => {
    if (value >= 1000000) return Math.floor(value / 1000000) + "M";
    if (value >= 1000) return Math.floor(value / 1000) + "K";
    return value;
};

const API_CACHE_TTL = 2 * 60 * 1000;

export const fetchCachedJson = async (url, ttl = API_CACHE_TTL) => {
    const cacheKey = `yt_api_cache:${url}`;
    try {
        const cached = JSON.parse(sessionStorage.getItem(cacheKey));
        if (cached && Date.now() - cached.timestamp < ttl) return cached.data;
    } catch {
        sessionStorage.removeItem(cacheKey);
    }

    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.error?.message || 'Unable to load data right now.');

    try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
    } catch {
        // Cached data is optional; the request result is still usable.
    }
    return data;
};

const watchedVideosKey = 'yt_watched_videos';

export const getWatchedVideos = () => {
    try {
        return JSON.parse(localStorage.getItem(watchedVideosKey)) || [];
    } catch {
        return [];
    }
};

export const markVideoWatched = (videoId) => {
    const watchedVideos = getWatchedVideos();
    if (!watchedVideos.includes(videoId)) {
        localStorage.setItem(watchedVideosKey, JSON.stringify([...watchedVideos, videoId]));
    }
};

    
 

