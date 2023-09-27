import { useState, useEffect, useRef } from "react";

function useCursorInside(): [boolean, React.RefObject<HTMLDivElement>] {
  const [isInside, setIsInside] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function checkPosition(e: MouseEvent) {
      if (ref.current) {
        if (ref.current.contains(e.target as Node)) {
          setIsInside(true);
        } else {
          setIsInside(false);
        }
      }
    }

    document.addEventListener("mousemove", checkPosition);

    return () => {
      document.removeEventListener("mousemove", checkPosition);
    };
  }, []);

  return [isInside, ref];
}

export default useCursorInside;
