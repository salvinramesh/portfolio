import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { GameProvider } from "@/context/GameContext";

// Eagerly loaded — defines initial visual impression
import CustomCursor from "@/components/ui/CustomCursor";
import ScrollProgress from "@/components/ui/ScrollProgress";
import ScanlineOverlay from "@/components/ui/ScanlineOverlay";
import ParticleBackground from "@/components/ui/ParticleBackground";
import ClearanceBadge from "@/components/ui/ClearanceBadge";
import AudioVisualizer from "@/components/ui/AudioVisualizer";

// Lazily loaded — interactive features & overlays (via client wrapper)
import DynamicOverlays from "@/components/ui/DynamicOverlays";
import HackingMinigame from "@/components/ui/HackingMinigame";
import GridBackground from "@/components/ui/GridBackground";
import ThemeToggle from "@/components/ui/ThemeToggle";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Salvin Ramesh | IT Engineer & SysAdmin",
  description: "Portfolio of Salvin Ramesh, an IT Engineer specializing in Infrastructure, Systems Operations, and Security.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${orbitron.variable} ${rajdhani.variable} font-sans antialiased bg-black text-white selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden`}
      >
        <ScanlineOverlay />
        <GridBackground />
        <ParticleBackground />
        <ScrollProgress />
        <div className="fixed inset-0 z-[-3] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900/50 via-black to-black"></div>
        <ThemeProvider>
          <GameProvider>
            <CustomCursor />
            <AudioVisualizer />
            <ClearanceBadge />
            <ThemeToggle />
            <DynamicOverlays />
            <HackingMinigame />
            {children}
          </GameProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
