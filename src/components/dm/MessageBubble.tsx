import React from "react";

interface MessageBubbleProps {
  isOwn: boolean;
  children: React.ReactNode;
}

export default function MessageBubble({ isOwn, children }: MessageBubbleProps) {
  return (
    <div className={`relative max-w-xs lg:max-w-md`}>
      <div
        className={`px-4 py-2 rounded-lg ${
          isOwn
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-900"
        }`}
        style={{
          borderTopRightRadius: isOwn ? 0 : undefined,
          borderTopLeftRadius: !isOwn ? 0 : undefined,
        }}
      >
        {children}
      </div>
      {/* Arrow */}
      <span
        className={`absolute top-0 ${
          isOwn ? "right-0" : "left-0"
        }`}
        style={{
          width: 0,
          height: 0,
          borderTop: "10px solid transparent",
          borderBottom: "10px solid transparent",
          borderLeft: isOwn ? "10px solid #2563eb" : undefined,
          borderRight: !isOwn ? "10px solid #f3f3f3" : undefined,
        }}
      />
    </div>
  );
}