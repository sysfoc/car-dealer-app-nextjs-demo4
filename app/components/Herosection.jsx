"use client";
import Image from "next/image";
import { FaArrowRight, FaCar, FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useCallback, useDeferredValue } from "react";
import axios from "axios";

const FALLBACK_HEADING = "Premium Automotive Platform Built for Dealers";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_KEY = "homepage_data";

// Cache utilities
const CacheManager = {
  get: (key) => {
    try {
      if (typeof window === "undefined") return null;

      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp > CACHE_DURATION) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.warn("Cache retrieval failed:", error);
      return null;
    }
  },

  set: (key, data) => {
    try {
      if (typeof window === "undefined") return;

      const cacheData = {
        data,
        timestamp: Date.now(),
      };

      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn("Cache storage failed:", error);
    }
  },

  clear: (key) => {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("Cache clear failed:", error);
    }
  },
};

// Axios instance with caching configuration
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=3600", // 1 hour cache
  },
});

// Add request interceptor for cache checking
apiClient.interceptors.request.use((config) => {
  const cachedData = CacheManager.get(CACHE_KEY);
  if (cachedData && config.url?.includes("/api/homepage")) {
    // Return cached data as a resolved promise
    config.adapter = () =>
      Promise.resolve({
        data: cachedData,
        status: 200,
        statusText: "OK",
        headers: {},
        config,
        request: {},
      });
  }
  return config;
});

// Add response interceptor for caching
apiClient.interceptors.response.use(
  (response) => {
    // Cache successful API responses
    if (
      response.config.url?.includes("/api/homepage") &&
      response.status === 200
    ) {
      CacheManager.set(CACHE_KEY, response.data);
    }
    return response;
  },
  (error) => {
    console.error("API request failed:", error.message);
    return Promise.reject(error);
  },
);

const HeroSection = () => {
  const router = useRouter();
  const [headingData, setHeadingData] = useState(FALLBACK_HEADING);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isContentVisible, setIsContentVisible] = useState(true);
  const [imageCached, setImageCached] = useState(false);

  const deferredHeading = useDeferredValue(headingData);

  const heroImage = "/abc1.webp";

  // Enhanced data fetching with proper error handling and caching
  const fetchHomepageData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check cache first
      const cachedData = CacheManager.get(CACHE_KEY);
      if (cachedData?.searchSection?.mainHeading) {
        setHeadingData(cachedData.searchSection.mainHeading);
        setIsLoading(false);
        return;
      }

      const response = await apiClient.get("/api/homepage", {
        params: {
          timestamp: Date.now(), // Prevent browser caching conflicts
        },
      });

      if (
        response.data?.searchSection?.mainHeading &&
        response.data.searchSection.mainHeading !== FALLBACK_HEADING
      ) {
        setHeadingData(response.data.searchSection.mainHeading);
      }
    } catch (error) {
      console.error("Error fetching homepage data:", error);
      setError(error.message);

      // Try to use stale cache data as fallback
      const staleCache = localStorage.getItem(CACHE_KEY);
      if (staleCache) {
        try {
          const { data } = JSON.parse(staleCache);
          if (data?.searchSection?.mainHeading) {
            setHeadingData(data.searchSection.mainHeading);
          }
        } catch (parseError) {
          console.warn("Failed to parse stale cache data:", parseError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Image caching and optimization utilities
  const preloadAndCacheImage = useCallback(async (src) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();

      img.onload = () => {
        setImageCached(true);
        resolve(img);
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.crossOrigin = "anonymous";
      img.src = src;
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const initializeData = async () => {
      if (!isMounted) return;

      // Use requestIdleCallback for better performance
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        requestIdleCallback(
          () => {
            if (isMounted) {
              timeoutId = setTimeout(() => fetchHomepageData(), 150);
            }
          },
          { timeout: 5000 },
        );
      } else {
        timeoutId = setTimeout(() => fetchHomepageData(), 300);
      }
    };

    initializeData();

    // Preload hero image for better caching
    if (typeof window !== "undefined") {
      preloadAndCacheImage(heroImage).catch(console.warn);
    }

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [fetchHomepageData, preloadAndCacheImage, heroImage]);

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
    if (!text) return [{ text: FALLBACK_HEADING, style: "normal" }];

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

  const textParts = useMemo(
    () => splitHeadingAfterTwoWords(deferredHeading),
    [deferredHeading, splitHeadingAfterTwoWords],
  );

  const textSizeClass = useMemo(
    () => getResponsiveTextSize(deferredHeading),
    [deferredHeading, getResponsiveTextSize],
  );

  const processedHeading = useMemo(() => {
    if (!headingData && !isLoading) return null;

    return (
      <h1 className={`font-bold leading-tight ${textSizeClass} ${isLoading ? "opacity-75" : "opacity-100"}`}>
        {renderStyledParts(textParts)}
      </h1>
    );
  }, [headingData, isLoading, textSizeClass, renderStyledParts, textParts]);

  const HeadingSkeleton = useMemo(() => (
    <div className="w-full max-w-4xl space-y-4">
      <div className="h-12 animate-pulse rounded-lg bg-white/20 backdrop-blur-sm sm:h-16 lg:h-20"></div>
      <div className="mx-auto h-12 w-3/4 animate-pulse rounded-lg bg-white/20 backdrop-blur-sm sm:h-16 lg:h-20"></div>
    </div>
  ), []);

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
        />
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/70"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"></div>
        
        <div className="absolute inset-0 bg-gray-900/20 dark:bg-gray-900/40"></div>
      </div>

      <div className="relative z-10 mx-auto min-h-screen max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-screen items-center py-16 mt-6">
          <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            
            <div className={`lg:col-span-7 xl:col-span-6 space-y-8 lg:space-y-10 transition-all duration-1000 ${
              isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              
              <div className="inline-flex items-center space-x-2 rounded-full border border-red-400/30 bg-red-500/10 backdrop-blur-sm px-4 py-2 text-sm font-medium text-red-300">
                <FaCar className="h-4 w-4" />
                <span>Professional Automotive Solutions</span>
              </div>

              <div className="space-y-6">
                {isLoading ? (
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
            }`}>
              
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
      <div className="absolute top-20 right-20 h-16 w-16 rounded-full bg-red-400/20 backdrop-blur-sm opacity-40 animate-pulse"></div>
      
      <div className="absolute inset-0 opacity-5 z-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255,255,255)_1px,transparent_0)] bg-[size:50px_50px]"></div>
      </div>
 </section>
  );
};

export default HeroSection;