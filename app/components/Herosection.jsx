"use client";
import Image from "next/image";
import { FaArrowRight, FaCar, FaCheckCircle } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";

const HeroSection = () => {
  const t = useTranslations("HomePage");
  const router = useRouter();
  const [headingData, setHeadingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isContentVisible, setIsContentVisible] = useState(false);

  const heroImage = "/abc1.webp";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/homepage", {next: { revalidate: 3600 }});
        const result = await response.json();
        if (response.ok) {
          setHeadingData(result.searchSection?.mainHeading);
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsContentVisible(true);
          });
        });
      }
    };

    fetchData();
  }, []);

  const features = useMemo(() => [
    "Premium Vehicle Selection",
    "Expert Professional Service", 
    "Competitive Market Pricing"
  ], []);

  const navigateToCarSale = useCallback(() => {
    router.push("/car-for-sale");
  }, [router]);

  const navigateToLikedCars = useCallback(() => {
    router.push("/liked-cars");
  }, [router]);

  const splitHeadingAfterTwoWords = useCallback((text) => {
    if (!text) return null;

    const words = text.split(" ");
    if (words.length <= 2) {
      return [{ text, style: "normal" }];
    }

    const firstTwoWords = words.slice(0, 2).join(" ");
    const nextTwoWords = words.slice(2, 4).join(" ");
    const remainingWords = words.slice(4).join(" ");

    const parts = [
      { text: firstTwoWords + " ", style: "normal" },
      { text: nextTwoWords, style: "gradient" },
    ];

    if (remainingWords) {
      parts.push({ text: " " + remainingWords, style: "normal" });
    }

    return parts;
  }, []);

  const renderStyledParts = useCallback((parts) => {
    return parts.map((part, index) => {
      switch (part.style) {
        case 'gradient':
          return (
            <span 
              key={index} 
              className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent drop-shadow-sm"
            >
              {part.text}
            </span>
          );
        default:
          return (
            <span key={index} className="text-white drop-shadow-lg">
              {part.text}
            </span>
          );
      }
    });
  }, []);

  const getResponsiveTextSize = useCallback((text) => {
    if (!text) return "text-4xl sm:text-5xl lg:text-6xl";
    const length = text.length;
    if (length < 40) return "text-4xl sm:text-5xl lg:text-6xl xl:text-7xl";
    if (length < 80) return "text-3xl sm:text-4xl lg:text-5xl xl:text-6xl";
    return "text-2xl sm:text-3xl lg:text-4xl xl:text-5xl";
  }, []);

  const processedHeading = useMemo(() => {
    if (!headingData) return null;

    const parts = splitHeadingAfterTwoWords(
      typeof headingData === "string" ? headingData : String(headingData),
    );

    const textSizeClass = getResponsiveTextSize(
      typeof headingData === "string" ? headingData : String(headingData),
    );

    return (
      <h1 className={`font-bold leading-tight ${textSizeClass}`}>
        {renderStyledParts(parts)}
      </h1>
    );
  }, [headingData, splitHeadingAfterTwoWords, getResponsiveTextSize, renderStyledParts]);

  const HeadingSkeleton = useMemo(() => (
    <div className="w-full max-w-4xl space-y-4">
      <div className="h-12 animate-pulse rounded-lg bg-white/20 backdrop-blur-sm sm:h-16 lg:h-20"></div>
      <div className="mx-auto h-12 w-3/4 animate-pulse rounded-lg bg-white/20 backdrop-blur-sm sm:h-16 lg:h-20"></div>
    </div>
  ), []);

  const handleImageError = useCallback((e) => {
    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23111827;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23374151;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1920' height='1080' fill='url(%23grad)'/%3E%3Ctext x='960' y='540' font-family='Arial' font-size='48' fill='%23ffffff' text-anchor='middle' dy='.3em'%3EPremium Automotive Platform%3C/text%3E%3C/svg%3E";
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt="Premium Vehicle Showcase"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={90}
          onError={handleImageError}
        />
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/70"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"></div>
        
        <div className="absolute inset-0 bg-gray-900/20 dark:bg-gray-900/40"></div>
      </div>

      <div className="relative z-10 mx-auto min-h-screen max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-screen items-center py-16">
          <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            
            <div className={`lg:col-span-7 xl:col-span-6 space-y-8 lg:space-y-10 transition-all duration-1000 ${
              isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              
              <div className="inline-flex items-center space-x-2 rounded-full border border-red-400/30 bg-red-500/10 backdrop-blur-sm px-4 py-2 text-sm font-medium text-red-300">
                <FaCar className="h-4 w-4" />
                <span>Professional Automotive Solutions</span>
              </div>

              <div className="space-y-6">
                {loading ? (
                  HeadingSkeleton
                ) : (
                  processedHeading || (
                    <h1 className="text-4xl font-bold leading-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
                      Premium{" "}
                      <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent drop-shadow-sm">
                        Automotive Platform
                      </span>{" "}
                      Built for Dealers
                    </h1>
                  )
                )}
              </div>

              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div 
                    key={feature}
                    className={`flex items-center space-x-3 transition-all duration-700 ${
                      isContentVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}
                    style={{ transitionDelay: `${(index + 1) * 200}ms` }}
                  >
                    <FaCheckCircle className="h-5 w-5 text-red-400 drop-shadow-sm" />
                    <span className="text-gray-200 font-medium drop-shadow-sm">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`lg:col-span-5 xl:col-span-6 flex flex-col items-center justify-center space-y-6 lg:items-end transition-all duration-1000 ${
              isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`} style={{ transitionDelay: '800ms' }}>
              
              <div className="flex flex-col gap-4 w-full max-w-sm lg:max-w-none">
                <button
                  onClick={navigateToCarSale}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-8 py-4 text-base font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-4 focus:ring-red-500/50 backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <div className="relative flex items-center justify-center">
                    <span className="mr-3">Browse Vehicles</span>
                    <FaArrowRight className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </button>

                <button
                  onClick={navigateToLikedCars}
                  className="group relative overflow-hidden rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-md px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:scale-105 hover:border-red-400/50 hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <div className="relative flex items-center justify-center">
                    <span className="mr-3">View Favorites</span>
                    <FaArrowRight className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-sm lg:max-w-none mt-8">
                <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center">
                  <div className="text-2xl font-bold text-white">20+</div>
                  <div className="text-sm text-gray-300">Search filters</div>
                </div>
                <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center">
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-sm text-gray-300">Expert Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-10 left-10 h-20 w-20 rounded-full bg-red-500/20 backdrop-blur-sm opacity-60 animate-pulse"></div>
      <div className="absolute top-20 right-20 h-16 w-16 rounded-full bg-red-400/20 backdrop-blur-sm opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="absolute inset-0 opacity-5 z-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255,255,255)_1px,transparent_0)] bg-[size:50px_50px]"></div>
      </div>
 </section>
  );
};

export default HeroSection;