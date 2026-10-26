import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const isError = toast.type === "error";
        const isInfo = toast.type === "info";
        const isSuccess = !isError && !isInfo;

        return (
          <div
            key={toast.id}
            className={`toast-item ${isError ? "toast-error" : isInfo ? "toast-info" : "toast-success"}`}
          >
            <div className="toast-icon">
              {isError && <AlertCircle size={18} />}
              {isInfo && <Info size={18} />}
              {isSuccess && <CheckCircle2 size={18} />}
            </div>
            <div className="toast-content">
              <strong>{toast.title || (isError ? "Error" : "Notification")}</strong>
              <p>{toast.message}</p>
            </div>
            <button
              className="toast-close"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss toast"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
