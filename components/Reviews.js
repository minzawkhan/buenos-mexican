'use client';

import { motion } from 'framer-motion';

// ============================================================
// 🗺️ GOOGLE MAPS CONFIGURATION
// Replace the values below when you have your Google Maps info
// ============================================================
const GOOGLE_MAPS_CONFIG = {
  // Your Google Maps Place ID (find it at: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder)
  placeId: 'YOUR_PLACE_ID_HERE',

  // Direct link for customers to leave a review
  // Format: https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID
  writeReviewUrl: 'https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID_HERE',

  // Direct link to see all Google reviews
  // Format: https://search.google.com/local/reviews?placeid=YOUR_PLACE_ID
  allReviewsUrl: 'https://search.google.com/local/reviews?placeid=YOUR_PLACE_ID_HERE',
};
// ============================================================

// Sample reviews to display — replace or extend as needed
const reviews = [
  {
    name: 'Sarah T.',
    rating: 5,
    date: 'April 2026',
    text: 'The best Mexican food we\'ve had in Bangkok! The Carne Asada tacos were incredible, and the homemade salsas are absolutely addicting. We came back three times in one week!',
    avatar: 'S',
    color: '#D32F2F',
  },
  {
    name: 'James K.',
    rating: 5,
    date: 'March 2026',
    text: 'Genuinely authentic flavors that took me straight back to Mexico City. The Buenos Hotcha salsa is no joke — perfect heat. Service was warm and welcoming every time.',
    avatar: 'J',
    color: '#1976D2',
  },
  {
    name: 'Nadia P.',
    rating: 5,
    date: 'March 2026',
    text: 'The Tuesday Margarita night is unmissable. Great vibes, generous portions, and the chips and guacamole are freshly made. A hidden gem in the city!',
    avatar: 'N',
    color: '#388E3C',
  },
  {
    name: 'Marcus L.',
    rating: 5,
    date: 'February 2026',
    text: 'Came for a birthday dinner and it was perfect. The Wet Burrito was massive and absolutely delicious. The staff remembered our order preferences — top-tier hospitality.',
    avatar: 'M',
    color: '#F57C00',
  },
  {
    name: 'Priya S.',
    rating: 5,
    date: 'February 2026',
    text: 'Cannot stop thinking about the Pico de Gallo and the churros. The floating card design of the menu is so pretty too — matches the restaurant aesthetic perfectly!',
    avatar: 'P',
    color: '#7B1FA2',
  },
];

const StarRating = ({ rating }) => (
  <div style={{ display: 'flex', gap: '3px', marginBottom: '0.75rem' }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <svg key={star} width="18" height="18" viewBox="0 0 24 24" fill={star <= rating ? '#FBBC04' : '#ddd'}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

const ReviewCard = ({ review, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ delay: 0.1 + index * 0.1, duration: 0.6, ease: 'easeOut' }}
    style={{
      backgroundColor: 'var(--background)',
      borderRadius: '16px',
      padding: '1.75rem',
      boxShadow: '0 4px 20px rgba(62,39,35,0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      border: '1px solid var(--border)',
      position: 'relative',
    }}
  >
    {/* Google G logo watermark */}
    <div style={{
      position: 'absolute',
      top: '1.25rem',
      right: '1.25rem',
      width: '24px',
      height: '24px',
      opacity: 0.25,
    }}>
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    </div>

    {/* Avatar + Name */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        backgroundColor: review.color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '800',
        fontSize: '1.1rem',
        flexShrink: 0,
      }}>
        {review.avatar}
      </div>
      <div>
        <p style={{ fontWeight: '700', color: 'var(--foreground)', fontSize: '1rem' }}>{review.name}</p>
        <p style={{ color: 'var(--text-muted, #999)', fontSize: '0.8rem' }}>{review.date}</p>
      </div>
    </div>

    <StarRating rating={review.rating} />

    <p style={{ color: 'var(--foreground)', lineHeight: '1.65', fontSize: '0.95rem', opacity: 0.85 }}>
      "{review.text}"
    </p>
  </motion.div>
);

export default function Reviews() {
  return (
    <section id="reviews" className="py-24 relative">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="container solid-content-card"
      >
        {/* Header */}
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <h2 className="script-font text-primary" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', marginBottom: '0.5rem' }}>
            What Our Guests Say
          </h2>
          <p className="text-gray text-xl" style={{ fontStyle: 'italic', marginBottom: '1.5rem' }}>
            Real reviews from real food lovers
          </p>

          {/* Overall rating badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '50px',
            padding: '0.6rem 1.5rem',
          }}>
            <div style={{ display: 'flex', gap: '3px' }}>
              {[1,2,3,4,5].map(s => (
                <svg key={s} width="20" height="20" viewBox="0 0 24 24" fill="#FBBC04">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--foreground)' }}>5.0</span>
            <span style={{ color: 'var(--text-muted, #999)', fontSize: '0.9rem' }}>on Google</span>
          </div>
        </div>

        {/* Review Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '3rem',
        }}>
          {reviews.map((review, index) => (
            <ReviewCard key={index} review={review} index={index} />
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          <motion.a
            href={GOOGLE_MAPS_CONFIG.writeReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              padding: '0.9rem 2.2rem',
              borderRadius: '50px',
              fontWeight: '700',
              fontSize: '1rem',
              textDecoration: 'none',
              letterSpacing: '0.04em',
              boxShadow: '0 4px 20px rgba(139,28,28,0.35)',
            }}
          >
            {/* Google icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#fff"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
            </svg>
            Leave Us a Review on Google
          </motion.a>

          <motion.a
            href={GOOGLE_MAPS_CONFIG.allReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              backgroundColor: 'transparent',
              color: 'var(--primary)',
              padding: '0.9rem 2.2rem',
              borderRadius: '50px',
              fontWeight: '700',
              fontSize: '1rem',
              textDecoration: 'none',
              letterSpacing: '0.04em',
              border: '2px solid var(--primary)',
            }}
          >
            See All Google Reviews →
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
