// import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getServerSession } from 'next-auth';
import GoogleAnalytics from "@/components/GoogleAnalytics";
 


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: 'Movie Mania LK - Download Sinhala Subtitles for Movies & TV Series',
    template: '%s | Movie Mania LK',
  },
  description: 'Download Sinhala subtitles for the latest movies and TV series. Your ultimate source for Sinhala translated subtitles in Sri Lanka.',
  keywords: ['Sinhala subtitles', 'movie subtitles', 'TV series subtitles', 'Sinhala films', 'Sri Lanka movies', 'subtitle download', 'සිංහල උපසිරැසි'],
  authors: [{ name: 'Movie Mania LK' }],
  creator: 'Movie Mania LK',
  publisher: 'Movie Mania LK',
  // robots: {
  //   index: true,
  //   follow: true,
  //   googleBot: {
  //     index: true,
  //     follow: true,
  //     'max-video-preview': -1,
  //     'max-image-preview': 'large',
  //     'max-snippet': -1,
  //   },
  // },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.moviemanialk.com',
    siteName: 'Movie Mania LK',
    title: 'Movie Mania LK - Download Sinhala Subtitles for Movies & TV Series',
    description: 'Download Sinhala subtitles for the latest movies and TV series. Your ultimate source for Sinhala translated subtitles in Sri Lanka.',
    images: [
      {
        url: 'https://www.moviemanialk.com/baner.png',
        width: 1200,
        height: 630,
        alt: 'Movie Mania LK - Sinhala Subtitles',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Movie Mania LK - Download Sinhala Subtitles for Movies & TV Series',
    description: 'Download Sinhala subtitles for the latest movies and TV series. Your ultimate source for Sinhala translated subtitles in Sri Lanka.',
    creator: '@moviemanialk',
    images: ['https://www.moviemanialk.com/baner.png'],
  },
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  // },

  alternates: {
    canonical: 'https://www.moviemanialk.com',
  },
  other: {
    monetag: '0faa976eb74b8ed2b84e79c6c85df2f3',
  },
};

export default async function RootLayout({ children }) {
  
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <GoogleAnalytics />
          
         
          {children}
    
        
      </body>
    </html>
  );
}

