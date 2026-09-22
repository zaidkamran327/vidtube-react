import './SkeletonCard.css'

const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton skeleton-thumb" />
        <div className="skeleton-info">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-title short" />
            <div className="skeleton skeleton-meta" />
        </div>
    </div>
)

const SkeletonFeed = () => (
    <div className="feed">
        {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
    </div>
)

export default SkeletonFeed
