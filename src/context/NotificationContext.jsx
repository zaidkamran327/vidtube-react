import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiKey } from '../data';

const NotificationContext = createContext();
const seenStorageKey = 'yt_seen_uploads';
const notificationStorageKey = 'yt_notifications';

const readStorage = (key, fallback) => {
    try {
        return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
        return fallback;
    }
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState(() => readStorage(notificationStorageKey, []));

    useEffect(() => {
        localStorage.setItem(notificationStorageKey, JSON.stringify(notifications));
    }, [notifications]);

    const checkForUploads = useCallback(async (subscriptions) => {
        if (!subscriptions.length || !apiKey) return;

        const previousSeen = readStorage(seenStorageKey, {});
        const nextSeen = { ...previousSeen };
        const newlyUploaded = [];

        await Promise.all(subscriptions.map(async (channel) => {
            try {
                const channelResponse = await fetch(
                    `https://youtube.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channel.id}&key=${apiKey}`
                ).then(response => response.json());
                const uploadsPlaylistId = channelResponse.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
                if (!uploadsPlaylistId) return;

                const playlistResponse = await fetch(
                    `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=5&playlistId=${uploadsPlaylistId}&key=${apiKey}`
                ).then(response => response.json());
                const uploads = playlistResponse.items || [];
                const uploadIds = uploads.map(item => item.snippet.resourceId.videoId);
                const oldIds = previousSeen[channel.id];

                if (oldIds) {
                    uploads.forEach(item => {
                        const videoId = item.snippet.resourceId.videoId;
                        if (!oldIds.includes(videoId)) {
                            newlyUploaded.push({
                                id: videoId,
                                title: item.snippet.title,
                                channelName: channel.name,
                                thumbnail: item.snippet.thumbnails?.medium?.url || channel.thumbnail,
                                publishedAt: item.snippet.publishedAt,
                                read: false,
                            });
                        }
                    });
                }

                nextSeen[channel.id] = uploadIds;
            } catch {
                // A failed channel check should not erase its previous upload history.
            }
        }));

        localStorage.setItem(seenStorageKey, JSON.stringify(nextSeen));
        if (newlyUploaded.length) {
            setNotifications(previous => {
                const existingIds = new Set(previous.map(notification => notification.id));
                const additions = newlyUploaded.filter(notification => !existingIds.has(notification.id));
                return [...additions, ...previous].slice(0, 50);
            });
        }
    }, []);

    const markAllRead = () => {
        setNotifications(previous => previous.map(notification => ({ ...notification, read: true })));
    };

    const clearNotifications = () => setNotifications([]);

    return (
        <NotificationContext.Provider value={{ notifications, checkForUploads, markAllRead, clearNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
