import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CounterAnimation = ({ end, duration = 2, suffix = '', prefix = '', delay = 0 }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasStarted(true);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(easeOutCubic * end);
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, hasStarted]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <span>
      {prefix}{hasStarted ? formatNumber(count) : '0'}{suffix}
    </span>
  );
};

const DynamicStatCard = ({ endNumber, label, delay = 0, suffix = '+', prefix = '', showStar = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
    className="text-center"
  >
    <div className="text-4xl font-bold text-white mb-2">
      <CounterAnimation 
        end={endNumber} 
        duration={2.5} 
        suffix={showStar ? '★' : suffix} 
        prefix={prefix}
        delay={delay}
      />
    </div>
    <div className="text-gray-400 text-sm">{label}</div>
  </motion.div>
);

export default DynamicStatCard;
