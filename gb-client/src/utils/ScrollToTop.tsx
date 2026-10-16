import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// Scrolls to the top when the route changes. Not on the first render: the
// visitor may already have scrolled the pre-rendered home page by then.
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
