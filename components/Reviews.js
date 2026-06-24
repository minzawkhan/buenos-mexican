'use client';

import { motion } from 'framer-motion';

// ============================================================
// GOOGLE MAPS CONFIGURATION
// Replace the values below when you have your Google Maps info
// ============================================================
const GOOGLE_MAPS_CONFIG = {
  placeId: 'ChIJWdYV0GmXAjERZKVSfLLfHjg',
  writeReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJWdYV0GmXAjERZKVSfLLfHjg',
  allReviewsUrl: 'https://maps.app.goo.gl/TNZ6WWNeLXo1Aqs97',
};

const reviews = [
  {
    name: 'Joey B.',
    badge: 'Local Guide',
    rating: 5,
    source: 'google',
    text: 'Good to have a tasty new restaurant at the Jomtien complex. It\'s new, very vibrantly decorated, clean and tasteful, with great Mexican vibes. I had the 3-tacos set — different fillings, all good — and the frozen mango margarita was delicious. Staff are very friendly and speak English. I\'ll be back for sure!',
    avatar: 'J',
    color: '#D32F2F',
  },
  {
    name: 'Everything A-Z, LLC',
    badge: null,
    rating: 5,
    source: 'google',
    text: 'This place is excellent! Food, service, atmosphere, staff are all very friendly. Being from Texas and loving Tex-Mex, this is the best Mexican food I\'ve had in Thailand.',
    avatar: 'E',
    color: '#1976D2',
  },
  {
    name: 'Rudolf',
    badge: 'Local Guide',
    rating: 5,
    source: 'google',
    text: 'One of the better Mexican restaurants in the Pattaya area. Friendly, attentive staff, food really delicious and fairly priced, and the surroundings are great. There are specials with nice discounts every weekday. For sure we\'ll visit again.',
    avatar: 'R',
    color: '#388E3C',
  },
  {
    name: 'Kevin B.',
    badge: null,
    rating: 5,
    source: 'tripadvisor',
    text: 'Do you need your Mexican food fix? This is THE place. Large, clean, nicely decorated, with a welcoming staff. All the flavors you want are there — and the cheese is the real thing, a taste of home.',
    avatar: 'K',
    color: '#F57C00',
  },
  {
    name: 'Gareth K.',
    badge: 'Chester, UK',
    rating: 5,
    source: 'tripadvisor',
    text: 'A truly superb restaurant. The food was as good if not better than Mexican food we\'ve had in Mexico. Really balanced flavours that just worked. Don\'t hesitate — go and enjoy.',
    avatar: 'G',
    color: '#7B1FA2',
  },
  {
    name: 'Laura S.',
    badge: null,
    rating: 5,
    source: 'tripadvisor',
    text: 'A great place for a casual evening out. The food is delicious and served quickly, reasonably priced, and the service is excellent. Highly recommend.',
    avatar: 'L',
    color: '#00796B',
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

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const TripAdvisorIcon = () => (
  <svg viewBox="0 0 24 24" fill="#34E0A1" width="22" height="22">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
  </svg>
);

const ReviewCard = ({ review, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ delay: 0.1 + index * 0.1, duration: 0.6, ease: 'easeOut' }}
    whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(139,28,28,0.18)', borderColor: 'var(--primary)' }}
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
      cursor: 'default',
      transition: 'border-color 0.2s',
    }}
  >
    {/* Platform watermark */}
    <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', opacity: 0.3 }}>
      {review.source === 'google' ? <GoogleIcon /> : <TripAdvisorIcon />}
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
        {review.badge && (
          <p style={{ color: 'var(--text-muted, #999)', fontSize: '0.78rem' }}>{review.badge}</p>
        )}
      </div>
    </div>

    <StarRating rating={review.rating} />

    <p style={{ color: 'var(--foreground)', lineHeight: '1.65', fontSize: '0.95rem', opacity: 0.85 }}>
      &ldquo;{review.text}&rdquo;
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

          {/* Rating badge — Google only */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '50px',
            padding: '0.5rem 1.25rem',
          }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1,2,3,4,5].map(s => (
                <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill="#FBBC04">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--foreground)' }}>5.0</span>
            <span style={{ color: 'var(--text-muted, #999)', fontSize: '0.82rem' }}>on Google</span>
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
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center w-full" style={{ padding: '0 16px' }}>
          <motion.a
            href={GOOGLE_MAPS_CONFIG.writeReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
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
              width: '100%',
              maxWidth: '360px',
            }}
          >
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
              justifyContent: 'center',
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
              width: '100%',
              maxWidth: '360px',
            }}
          >
            See All Google Reviews →
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
