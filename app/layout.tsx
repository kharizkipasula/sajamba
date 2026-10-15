import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Poppins, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-poppins',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Bajamba Event Manager — Makan Bajamba Sawahlunto',
  description:
    'Aplikasi manajemen acara, e-tiket QR Code, pemetaan tenda, check-in, dan laporan katering Makan Bajamba Sawahlunto.',
  openGraph: {
    title: 'Bajamba Event Manager — Makan Bajamba Sawahlunto',
    description:
      'Aplikasi manajemen acara, e-tiket QR Code, pemetaan tenda, check-in, dan laporan katering Makan Bajamba Sawahlunto.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bajamba Event Manager — Makan Bajamba Sawahlunto',
    description:
      'Aplikasi manajemen acara, e-tiket QR Code, pemetaan tenda, check-in, dan laporan katering Makan Bajamba Sawahlunto.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${plusJakarta.variable} ${poppins.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="bg-[#F8F9FC] text-[#1E194D] antialiased selection:bg-[#6355E5]/15 selection:text-[#6355E5]"
        style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
