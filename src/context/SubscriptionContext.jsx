import { createContext, useContext, useState, useEffect } from 'react';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
    const [subscriptions, setSubscriptions] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('yt_subscriptions')) || [];
        } catch { return []; }
    });

    useEffect(() => {
        localStorage.setItem('yt_subscriptions', JSON.stringify(subscriptions));
    }, [subscriptions]);

    const subscribe = (channel) => {
        setSubscriptions(prev => {
            const already = prev.find(c => c.id === channel.id);
            if (already) return prev;
            return [...prev, channel];
        });
    };

    const unsubscribe = (channelId) => {
        setSubscriptions(prev => prev.filter(c => c.id !== channelId));
    };

    const isSubscribed = (channelId) => subscriptions.some(c => c.id === channelId);

    return (
        <SubscriptionContext.Provider value={{ subscriptions, subscribe, unsubscribe, isSubscribed }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscriptions = () => useContext(SubscriptionContext);
