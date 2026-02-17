import { useEffect } from "react";
import gsap from "gsap";
import { TIMING, ANIMATION } from "../constants";

export const useMenuAnimation = (menuRef: React.RefObject<HTMLDivElement | null>, menuVisible: boolean) => {
  useEffect(() => {
    if (!menuVisible || !menuRef.current) return;

    gsap.fromTo(
      menuRef.current,
      ANIMATION.MENU_FROM,
      { 
        ...ANIMATION.MENU_TO, 
        duration: TIMING.MENU_ANIMATION_DURATION, 
        ease: ANIMATION.MENU_EASE 
      }
    );
  }, [menuVisible, menuRef]);
};
