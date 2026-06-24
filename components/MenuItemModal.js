'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function MenuItemModal({ item, onClose }) {
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [isGrande, setIsGrande] = useState(false);
  const [selectedSauce, setSelectedSauce] = useState(null);

  // Reset state when item changes
  useEffect(() => {
    if (item) {
      setSelectedStyle(item.tacoStyles ? item.tacoStyles[0] : null);
      setIsGrande(false);
      setSelectedSauce(item.sauceOptions ? item.sauceOptions[0] : null);
    }
  }, [item]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [item]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Compute display price — some prices are non-numeric (e.g. "(+) 30", "230 / 330")
  const basePrice = item ? parseInt(item.price, 10) : 0;
  const grandeAdd = item?.grandePrice || 0;
  const displayPrice = !isNaN(basePrice) ? (isGrande ? basePrice + grandeAdd : basePrice) : null;

  // Check if grande is disabled (street style selected)
  const isStreetStyle = selectedStyle === 'Street Style';
  const grandeDisabled = isStreetStyle;

  // Reset grande if switching to street style
  useEffect(() => {
    if (isStreetStyle && isGrande) {
      setIsGrande(false);
    }
  }, [isStreetStyle, isGrande]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="menu-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="menu-modal-content"
            initial={{ opacity: 0, scale: 0.85, y: 60 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 60 }}
            transition={{ duration: 0.4, type: 'spring', bounce: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button className="menu-modal-close" onClick={onClose} aria-label="Close modal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Image */}
            {item.image && (
              <div className="menu-modal-image-container">
                <div className="menu-modal-image-glow"></div>
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 90vw, 500px"
                  style={{ objectFit: 'cover' }}
                  priority
                />
                {/* Price badge on image */}
                <motion.div
                  className="menu-modal-price-badge"
                  key={item.price}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <span className="menu-modal-price-currency">฿</span>
                  <span className="menu-modal-price-value">{displayPrice ?? item.price}</span>
                </motion.div>
              </div>
            )}

            {/* Details */}
            <div className="menu-modal-details">
              <motion.h3
                className="menu-modal-name"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                {item.name}
              </motion.h3>

              {item.desc && (
                <motion.p
                  className="menu-modal-desc"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                >
                  {item.desc}
                </motion.p>
              )}

              {!item.desc && (
                <motion.p
                  className="menu-modal-desc menu-modal-desc-placeholder"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                >
                  {item.subcategoryDesc || 'A delicious selection from our authentic Mexican kitchen, prepared fresh with traditional recipes and the finest ingredients.'}
                </motion.p>
              )}

              <motion.div
                className="menu-modal-divider"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              ></motion.div>

              {/* ── Taco-specific: Style Selector ── */}
              {item.isTaco && !item.noTacoOptions && item.tacoStyles && (
                <motion.div
                  className="taco-options-section"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32, duration: 0.4 }}
                >
                  <div className="taco-options-label">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2C6.48 2 2 6 2 10c0 2.5 1.5 4.5 3.5 6 .5 1 0 3-1 4 2 0 4-1 5.5-2h2c5.52 0 10-4 10-8s-4.48-8-10-8z" />
                    </svg>
                    <span>Choose Your Style</span>
                  </div>
                  <div className="taco-style-pills">
                    {item.tacoStyles.map((style) => (
                      <motion.button
                        key={style}
                        className={`taco-style-pill${selectedStyle === style ? ' active' : ''}`}
                        onClick={() => setSelectedStyle(style)}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                      >
                        <span className="taco-style-icon">
                          {style === 'Crunchy' && '🌮'}
                          {style === 'Gringo (Soft Tortilla)' && '🫓'}
                          {style === 'Street Style' && '🔥'}
                        </span>
                        <span>{style}</span>
                        {selectedStyle === style && (
                          <motion.span
                            className="taco-style-check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                          >
                            ✓
                          </motion.span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Taco-specific: Grande Toggle ── */}
              {item.isTaco && !item.noTacoOptions && item.grandePrice && (
                <motion.div
                  className={`taco-grande-section${grandeDisabled ? ' disabled' : ''}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38, duration: 0.4 }}
                >
                  <div className="taco-grande-row" onClick={() => !grandeDisabled && setIsGrande(!isGrande)}>
                    <div className="taco-grande-info">
                      <div className="taco-grande-title">
                        <span className="taco-grande-icon">👑</span>
                        <span>Make it Grande</span>
                      </div>
                      <p className="taco-grande-desc">{item.grandeNote}</p>
                    </div>
                    <div className="taco-grande-toggle-area">
                      <span className="taco-grande-price">(+) ฿{item.grandePrice}</span>
                      <motion.div
                        className={`taco-grande-toggle${isGrande ? ' active' : ''}`}
                        layout
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <motion.div className="taco-grande-toggle-knob" layout />
                      </motion.div>
                    </div>
                  </div>
                  {grandeDisabled && (
                    <motion.p
                      className="taco-grande-disabled-note"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      Grande is not available for Street Style tacos
                    </motion.p>
                  )}
                </motion.div>
              )}

              {/* ── Enchilada-specific: Sauce Selector ── */}
              {item.sauceOptions && item.sauceOptions.length > 0 && (
                <motion.div
                  className="taco-options-section"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32, duration: 0.4 }}
                >
                  <div className="taco-options-label">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 14a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm1-5h-2V7h2z" />
                    </svg>
                    <span>Choose Your Sauce</span>
                  </div>
                  <div className="taco-style-pills">
                    {item.sauceOptions.map((sauce) => (
                      <motion.button
                        key={sauce}
                        className={`taco-style-pill sauce-pill${selectedSauce === sauce ? ' active' : ''}`}
                        onClick={() => setSelectedSauce(sauce)}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                      >
                        <span className="taco-style-icon">
                          {sauce.includes('Red') && '🌶️'}
                          {sauce.includes('Green') && '🟢'}
                        </span>
                        <span>{sauce}</span>
                        {selectedSauce === sauce && (
                          <motion.span
                            className="taco-style-check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                          >
                            ✓
                          </motion.span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Section Notes (e.g. style options, upgrades) */}
              {item.notes && item.notes.length > 0 && (
                <motion.div
                  className="menu-modal-notes"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32, duration: 0.4 }}
                >
                  {item.notes.map((note, i) => (
                    <div key={i} className="menu-modal-note">
                      <span className="menu-modal-note-label">{note.label}</span>
                      <span className="menu-modal-note-value">{note.value}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              <motion.div
                className="menu-modal-footer"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
              >
                <div className="menu-modal-tag">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                  <span>Freshly Prepared</span>
                </div>
                <div className="menu-modal-tag">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span>Authentic Recipe</span>
                </div>
                <div className="menu-modal-tag">
                  <span>🌿 Premium Quality</span>
                </div>
                <div className="menu-modal-tag">
                  <span>⏱️ Made to Order</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
