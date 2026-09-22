import { createContext, useContext, useState, useEffect } from 'react';

const SavedContext = createContext();

const load = (key) => {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
};

export const SavedProvider = ({ children }) => {
    const [watchLater, setWatchLater] = useState(() => load('yt_watch_later'));
    const [likedVideos, setLikedVideos] = useState(() => load('yt_liked_videos'));

    useEffect(() => localStorage.setItem('yt_watch_later', JSON.stringify(watchLater)), [watchLater]);
    useEffect(() => localStorage.setItem('yt_liked_videos', JSON.stringify(likedVideos)), [likedVideos]);

    const toggleWatchLater = (video) => {
        setWatchLater(prev =>
            prev.find(v => v.id === video.id)
                ? prev.filter(v => v.id !== video.id)
                : [...prev, video]
        );
    };

    const toggleLikedVideo = (video) => {
        setLikedVideos(prev =>
            prev.find(v => v.id === video.id)
                ? prev.filter(v => v.id !== video.id)
                : [...prev, video]
        );
    };

    const isInWatchLater = (id) => watchLater.some(v => v.id === id);
    const isLikedVideo = (id) => likedVideos.some(v => v.id === id);

    return (
        <SavedContext.Provider value={{ watchLater, likedVideos, toggleWatchLater, toggleLikedVideo, isInWatchLater, isLikedVideo }}>
            {children}
        </SavedContext.Provider>
    );
};

export const useSaved = () => useContext(SavedContext);
