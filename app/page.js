import SmoothScroll from '@/components/SmoothScroll';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import MenuCategories from '@/components/MenuCategories';
import VipFooterButton from '@/components/VipFooterButton';
import GrabFooterButton from '@/components/GrabFooterButton';
import FooterSocials from '@/components/FooterSocials';
import dynamic from 'next/dynamic';

const Specials = dynamic(() => import('@/components/Specials'));
const Reserve = dynamic(() => import('@/components/Reserve'));
const Salsas = dynamic(() => import('@/components/Salsas'));
const Location = dynamic(() => import('@/components/Location'));
const Reviews = dynamic(() => import('@/components/Reviews'));

export default function Home() {
  return (
    <SmoothScroll>
      <main className="min-h-screen relative">
        
        {/* Navigation */}
        <Navbar />

        <Hero />
        
        <MenuCategories />

        <Salsas />

        <Specials />
        <Reviews />
        <Reserve />
        <Location />
        
        {/* Footer */}
        <footer className="text-center" style={{ padding: '4rem 0', backgroundColor: 'var(--surface)', borderTop: '2px dashed var(--border)', position: 'relative', zIndex: 50 }}>
          <div className="container flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="anton-font text-foreground" style={{ fontSize: '1.875rem' }}>Buenos Mexican <span className="text-primary">Restaurant</span></div>

            <p className="text-gray" style={{ fontSize: '0.875rem', fontWeight: '500' }}>© 2026 Buenos Mexican Cuisine. All rights reserved.</p>

            <div className="flex flex-wrap gap-4 md:gap-6 justify-center items-center">
              <FooterSocials />
              <GrabFooterButton />
              <VipFooterButton />
            </div>
          </div>
        </footer>

      </main>
    </SmoothScroll>
  );
}
