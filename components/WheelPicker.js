'use client';

import { useEffect, useRef, useState } from 'react';

export default function WheelPicker({ options, value, onChange, label }) {
  const containerRef = useRef(null);
  const ITEM_HEIGHT = 44;
  const initialIndex = options.indexOf(value) !== -1 ? options.indexOf(value) : 0;
  
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  // Initialize scroll position on mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = initialIndex * ITEM_HEIGHT;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const timeoutRef = useRef(null);

  const prevValueRef = useRef(value);

  // Sync internal index with prop value when it changes from the outside
  useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      const index = options.indexOf(value);
      if (index !== -1) {
        setActiveIndex(index);
        // Ensure the scroll position matches the new value
        if (containerRef.current) {
          containerRef.current.scrollTop = index * ITEM_HEIGHT;
        }
      }
    }
  }, [value, options]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeIndexRef = useRef(activeIndex);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const offset = container.scrollTop;
      const index = Math.round(offset / ITEM_HEIGHT);
      const currentOptions = optionsRef.current;
      
      if (index >= 0 && index < currentOptions.length && index !== activeIndexRef.current) {
        setActiveIndex(index);
        
        // Debounce the onChange to prevent excessive re-renders in parent
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          onChangeRef.current(currentOptions[index]);
        }, 150);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="wheel-picker-container">
      <div className="wheel-picker-label">{label}</div>
      <div className="wheel-picker-viewport">
        {/* Highlight Overlay */}
        <div className="wheel-picker-highlight"></div>
        
        {/* Scrollable List */}
        <div 
          ref={containerRef}
          className="wheel-picker-scroll"
          style={{ height: ITEM_HEIGHT * 5 }}
        >
          {/* Padding at top and bottom to allow center alignment */}
          <div style={{ height: ITEM_HEIGHT * 2 }}></div>
          
          {options.map((option, i) => (
            <PickerItem 
              key={i} 
              label={option} 
              index={i} 
              activeIndex={activeIndex}
              itemHeight={ITEM_HEIGHT}
              onClick={() => {
                if (containerRef.current) {
                  containerRef.current.scrollTo({
                    top: i * ITEM_HEIGHT,
                    behavior: 'smooth'
                  });
                }
              }}
            />
          ))}
          
          <div style={{ height: ITEM_HEIGHT * 2 }}></div>
        </div>
      </div>

      <style jsx>{`
        .wheel-picker-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .wheel-picker-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--secondary);
          margin-bottom: 0.5rem;
          font-weight: 700;
        }
        .wheel-picker-viewport {
          position: relative;
          width: 100%;
          height: ${ITEM_HEIGHT * 5}px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .wheel-picker-highlight {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: ${ITEM_HEIGHT}px;
          transform: translateY(-50%);
          background: rgba(139, 28, 28, 0.1);
          border-top: 1px solid rgba(139, 28, 28, 0.3);
          border-bottom: 1px solid rgba(139, 28, 28, 0.3);
          pointer-events: none;
          z-index: 2;
        }
        .wheel-picker-scroll {
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 0 1rem;
        }
        .wheel-picker-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

function PickerItem({ label, index, activeIndex, itemHeight, onClick }) {
  const diff = Math.abs(index - activeIndex);
  const opacity = Math.max(0.3, 1 - diff * 0.3);
  const scale = Math.max(0.8, 1 - diff * 0.1);
  const rotateX = (index - activeIndex) * 20;

  return (
    <div 
      className="picker-item"
      onClick={onClick}
      style={{ 
        height: itemHeight,
        opacity,
        transform: `scale(${scale}) rotateX(${rotateX}deg)`,
        transition: 'all 0.2s ease-out',
        cursor: 'pointer'
      }}
    >
      {label}
      <style jsx>{`
        .picker-item {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--foreground);
          scroll-snap-align: center;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
