import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

export default function Toast({ message, onDone, duration = 2500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDone, duration);
    return () => clearTimeout(timer);
  }, [message, onDone, duration]);

  if (!message) return null;

  return (
    <div className="toast">
      <CheckCircle2 size={18} />
      <span>{message}</span>
    </div>
  );
}
