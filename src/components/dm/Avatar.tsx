import React from "react";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
}

export default function Avatar({ src, name, size = 40 }: AvatarProps) {
  const letter = name?.trim()?.charAt(0)?.toUpperCase() || "?";
  if (src) {
    return (
      <img
        src={src}
        alt={name || "User"}
        width={size}
        height={size}
        className="object-cover rounded-full"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: "#e7d1ff", // accent
        color: "#2a4aa1", // primary
        fontWeight: "bold",
        fontSize: size / 2,
        userSelect: "none"
      }}
    >
      {letter}
    </div>
  );
}