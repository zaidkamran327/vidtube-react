import { Link } from 'react-router-dom';
import './StatusMessage.css';

const StatusMessage = ({ title, message, action = 'Back to home', onRetry }) => (
    <div className="status-message">
        <h2>{title}</h2>
        <p>{message}</p>
        {onRetry ? (
            <div className="status-actions">
                <button onClick={onRetry}>Try again</button>
                <Link to="/">{action}</Link>
            </div>
        ) : (
            <Link to="/">{action}</Link>
        )}
    </div>
);

export default StatusMessage;
