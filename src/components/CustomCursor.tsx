import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";
import { useText } from "@/hooks/useText";

export const CustomCursor = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isEnabled = useText("settings.customCursor", "true") === "true";

  // Use springs for smooth following
  const cursorX = useSpring(0, { stiffness: 300, damping: 20 });
  const cursorY = useSpring(0, { stiffness: 300, damping: 20 });

  useEffect(() => {
    // Desktop only
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const moveCursor = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      cursorX.set(e.clientX - 16); // Center the 32px cursor
      cursorY.set(e.clientY - 16);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button")
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseOut = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible || !isEnabled) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[100] mix-blend-difference"
      style={{
        x: cursorX,
        y: cursorY,
        backgroundColor: "white",
      }}
      animate={{
        scale: isHovered ? 2 : 1,
        opacity: isHovered ? 0.8 : 1,
      }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    />
  );
};
