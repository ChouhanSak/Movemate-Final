import { useEffect, useRef, useState } from "react";

export default function Counter({ to, duration = 1500, color = "text-purple-600" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  const animate = () => {
    let start = 0;
    const increment = to / (duration / 16);

    const updateCounter = () => {
      start += increment;
      if (start < to) {
        setCount(Math.floor(start));
        requestAnimationFrame(updateCounter);
      } else {
        setCount(to);
      }
    };

    updateCounter();
  };

  return (
    <span ref={ref} className={`text-3xl font-bold ${color}`}>
      {count}
    </span>
  );
}
