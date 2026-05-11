import SmoothScroll from '@/components/SmoothScroll';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Specials from '@/components/Specials';
import Booking from '@/components/Booking';
import MenuCategories from '@/components/MenuCategories';
import Salsas from '@/components/Salsas';
import Location from '@/components/Location';
import Reviews from '@/components/Reviews';

export default function Home() {
  return (
    <SmoothScroll>
      <main className="min-h-screen">
        
        {/* Navigation */}
        <Navbar />

        <Hero />
        
        <MenuCategories />

        <Salsas />

        <Specials />
        <Reviews />
        <Booking />
        <Location />
        
        {/* Footer */}
        <footer className="text-center" style={{ padding: '3rem 0', backgroundColor: 'var(--surface)', borderTop: '2px dashed var(--border)' }}>
          <div className="container flex flex-col md-flex-row justify-between items-center gap-6">
            <div className="anton-font text-foreground" style={{ fontSize: '1.875rem' }}>BUENOS<span className="text-primary">MEX</span></div>
            <p className="text-gray" style={{ fontSize: '0.875rem' }}>© 2026 Buenos Mexican Restaurant. All rights reserved.</p>
            <div className="flex gap-4">
              <div className="footer-icon">FB</div>
              <div className="footer-icon">IG</div>
            </div>
          </div>
        </footer>

      </main>
    </SmoothScroll>
  );
}
