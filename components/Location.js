'use client';

import { motion } from 'framer-motion';

export default function Location() {
  return (
    <section id="location" className="py-24 relative perspective-container">
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="script-font text-secondary" 
            style={{ fontSize: 'clamp(3rem, 5vw, 4rem)', marginBottom: '0.5rem' }}
          >
            Visit Us
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="anton-font text-foreground" 
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Location & <span className="text-primary">Hours</span>
          </motion.h3>
        </div>

        <div className="grid grid-cols-1 md-grid-cols-2 gap-8 items-center">
          {/* Map Embed */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="rustic-section-box"
            style={{ padding: '1rem', marginBottom: 0, transformStyle: 'preserve-3d' }}
          >
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.760195679549!2d-118.2562479234857!3d34.05001711784964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c648b2eb59f5%3A0x6b6c071720857999!2sDowntown%20Los%20Angeles%2C%20Los%20Angeles%2C%20CA!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus" 
              width="100%" 
              height="400" 
              style={{ border: 0, borderRadius: '8px' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Restaurant Location"
            ></iframe>
          </motion.div>

          {/* Location Info */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="flex flex-col gap-6"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="rustic-section-box" style={{ marginBottom: 0, padding: '2rem' }}>
              <h4 className="anton-font text-primary" style={{ fontSize: '1.25rem', letterSpacing: '1px', marginBottom: '0.75rem' }}>ADDRESS</h4>
              <p className="text-foreground" style={{ fontSize: '1rem', lineHeight: '1.5' }}>
                123 Authentic Way,<br/>
                Downtown Los Angeles, CA 90012
              </p>
            </div>

            <div className="rustic-section-box" style={{ marginBottom: 0, padding: '2rem' }}>
              <h4 className="anton-font text-secondary" style={{ fontSize: '1.25rem', letterSpacing: '1px', marginBottom: '0.75rem' }}>HOURS</h4>
              <ul className="text-foreground" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                <li className="flex justify-between"><span>Mon - Thu</span> <span className="font-bold">11:00 AM - 10:00 PM</span></li>
                <li className="flex justify-between"><span>Fri - Sat</span> <span className="font-bold">11:00 AM - 11:00 PM</span></li>
                <li className="flex justify-between"><span>Sunday</span> <span className="font-bold">10:00 AM - 9:00 PM</span></li>
              </ul>
            </div>
            
            <div className="rustic-section-box" style={{ marginBottom: 0, padding: '2rem' }}>
              <h4 className="anton-font text-primary" style={{ fontSize: '1.25rem', letterSpacing: '1px', marginBottom: '0.75rem' }}>CONTACT</h4>
              <p className="text-foreground" style={{ fontSize: '1rem', lineHeight: '1.5' }}>
                Phone: <span className="font-bold">(555) 123-4567</span><br/>
                Email: hola@buenosmexican.com
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
