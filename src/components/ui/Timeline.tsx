import React from "react";
import { clsx } from "clsx";

export interface TimelineEvent {
  user: string;
  timestamp: string;
  action: string;
  oldValue?: string;
  newValue?: string;
}

export interface TimelineProps {
  events: TimelineEvent[];
  emptyMessage?: string;
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  events,
  emptyMessage = "No activities logged for this record.",
  className
}) => {
  return (
    <div className={clsx("space-y-4 font-mono text-[9px] text-white/60", className)}>
      {events && events.length > 0 ? (
        events.map((log, idx) => (
          <div key={idx} className="border-l-2 border-blue-500/30 pl-3 space-y-0.5 relative">
            {/* Dot marker */}
            <div className="absolute w-2 h-2 rounded-full bg-blue-500 -left-[5px] top-1 border border-[#0c0d10]" />
            
            <div className="flex justify-between text-white/30">
              <span>{log.user}</span>
              <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="text-white font-semibold capitalize">
              Action: {log.action.replace(/_/g, " ")}
            </p>
            {(log.oldValue || log.newValue) && (
              <div className="text-white/40">
                <span>
                  Change: {log.oldValue || "None"} ➔ {log.newValue || "None"}
                </span>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-white/20 italic text-center py-2">{emptyMessage}</div>
      )}
    </div>
  );
};
