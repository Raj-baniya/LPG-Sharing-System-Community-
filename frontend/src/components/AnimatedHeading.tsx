import { motion } from 'framer-motion';

interface AnimatedHeadingProps {
  text: string;
  className?: string;
}

export function AnimatedHeading({ text, className = "" }: AnimatedHeadingProps) {
  // Split lines on \n
  const lines = text.split('\n');
  let globalCharIndex = 0;
  
  return (
    <h1 className={className} style={{ letterSpacing: '-0.04em' }}>
      {lines.map((line, lineIndex) => {
        // Split line into words
        const words = line.split(' ');
        
        return (
          <span key={lineIndex} className="block">
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block" style={{ whiteSpace: 'nowrap' }}>
                {word.split('').map((char, charIndex) => {
                  const currentIndex = globalCharIndex++;
                  return (
                    <motion.span
                      key={`${lineIndex}-${wordIndex}-${charIndex}`}
                      className="inline-block"
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.2 + currentIndex * 0.03,
                        ease: "easeOut"
                      }}
                    >
                      {char}
                    </motion.span>
                  );
                })}
                {/* Render non-breaking space after the word, unless it is the last word in the line */}
                {wordIndex < words.length - 1 && (
                  <motion.span
                    key={`${lineIndex}-${wordIndex}-space`}
                    className="inline-block"
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.2 + (globalCharIndex++) * 0.03,
                      ease: "easeOut"
                    }}
                  >
                    {'\u00A0'}
                  </motion.span>
                )}
              </span>
            ))}
          </span>
        );
      })}
    </h1>
  );
}
