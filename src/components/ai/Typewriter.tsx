import { useEffect, useState } from "react";

interface TypewriterProps {
  text: string;
  speed?: number;
  onDone?: () => void;
  className?: string;
}

/**
 * 打字机效果组件
 */
export function Typewriter({ text, speed = 30, onDone, className }: TypewriterProps) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, onDone]);

  return (
    <span className={className}>
      {displayed}
      <span className="inline-block w-0.5 h-4 bg-primary-500 ml-0.5 animate-pulse align-middle" />
    </span>
  );
}
