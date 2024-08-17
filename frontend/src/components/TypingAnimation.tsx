// components/TypingAnimation.tsx
import { useEffect, useState } from "react";

const TypingAnimation = () => {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const words = ["Hello!", "!مرحبًا", "你好!", "Привет!", "¡Hola!", "Hej!"];
  const speed = 100; // typing speed
  const deleteSpeed = 100; // backspace speed

  useEffect(() => {
    const interval = setInterval(
      () => {
        const currentWord = words[index % words.length];
        if (isDeleting) {
          setText((prev) => prev.slice(0, -1));
          if (text === "") {
            setIsDeleting(false);
            setIndex((prev) => (prev + 1) % words.length);
          }
        } else {
          setText((prev) => currentWord.slice(0, prev.length + 1));
          if (text === currentWord) {
            setTimeout(() => {
              setIsDeleting(true);
            }, 300);
          }
        }
      },
      isDeleting ? deleteSpeed : speed
    );

    return () => clearInterval(interval);
  }, [text, index, isDeleting]);

  return (
    <div className="w-[80%] h-12 text-[2.5rem] text-left font-mono text-white">
      <span>{text}</span>
    </div>
  );
};

export default TypingAnimation;
