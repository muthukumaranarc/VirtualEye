import "./AlertModal.css";

export default function AlertModal({ onClose }) {
    return (
        <div className="alert-overlay">
            <div className="alert-modal">
                <h2>🚨 Human Detected!</h2>
                <p>VirtualEye detected a person.</p>
                <button onClick={onClose}>
                    Dismiss
                </button>
            </div>
        </div>
    );
}
