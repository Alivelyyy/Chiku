"use client";

import { useRef } from "react";
import { ExternalLink } from "lucide-react";

interface MiniPlayerProps {
  guildId: string;
}

export default function MiniPlayer({ guildId }: MiniPlayerProps) {
  const windowRef = useRef<Window | null>(null);

  const openPopupPlayer = () => {
    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.focus();
      return;
    }
    windowRef.current = window.open(
      `/player/${guildId}`,
      "ChikuMiniPlayer",
      "width=420,height=680,toolbar=no,menubar=no,location=no,resizable=yes"
    );
  };

  return (
    <button onClick={openPopupPlayer}
      className="btn-icon flex gap-1.5 px-3 w-auto text-[11px] font-bold">
      <ExternalLink className="w-3.5 h-3.5" /> Pop Out
    </button>
  );
}
