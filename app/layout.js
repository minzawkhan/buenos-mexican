import './globals.css';
import DynamicBackground from '@/components/DynamicBackground';

import ParticleTrail from '@/components/ParticleTrail';

export const metadata = {
  title: 'Buenos Mexican Restaurant | Taste the Difference',
  description: 'The best comfort food in Los Angeles. Experience the finest Mexican cuisine, from Tuesday Margaritas to Sunday Quesadillas.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>

        <ParticleTrail />
        <DynamicBackground />
        {children}
      </body>
    </html>
  );
}
