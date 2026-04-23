import { useEffect, useRef, useState } from "react";

export default function Counter({ to, duration = 1500, color = "text-purple-600" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  const animate = (target) => {
    let start = 0;
    const increment = target / (duration / 16);

    const updateCounter = () => {
      start += increment;
      if (start < target) {
        setCount(Math.floor(start));
        requestAnimationFrame(updateCounter);
      } else {
        setCount(target);
      }
    };

    updateCounter();
  };

  // Animate when in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate(to);
        }
      },
      { threshold: 0.4 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  // Animate whenever `to` changes after initial mount
  useEffect(() => {
    if (hasAnimated.current) {
      animate(to);
    }
  }, [to]);

  return (
    <span ref={ref} className={`text-3xl font-bold ${color}`}>
      {count}
    </span>
  );
}