export const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = '/thumbnail-placeholder.svg';
};

export const handleAvatarError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = '/avatar-placeholder.svg';
};
