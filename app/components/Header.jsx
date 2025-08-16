"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaHeart,
  FaSearch,
  FaTimes,
  FaCalculator,
  FaHandshake,
  FaCar,
  FaSun,
  FaMoon,
  FaTags,
  FaUser,
} from "react-icons/fa";
import CarSearchSidebar from "../components/Car-search-sidebar";
import { useSidebar } from "../context/SidebarContext";
import Image from "next/image";
import Banner from "./Banner"

const CACHE_DURATION = 5 * 60 * 1000;
const CACHE_KEY = 'header_settings';

const CacheManager = {
  get: (key) => {
    try {
      if (typeof window === 'undefined') return null;
      
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
      console.warn('Cache retrieval failed:', error);
      return null;
    }
  },

  set: (key, data) => {
    try {
      if (typeof window === 'undefined') return;
      
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Cache storage failed:', error);
    }
  }
};

// Static fallback data to prevent loading states
const DEFAULT_SETTINGS = {
  hideDarkMode: false,
  hideFavourite: false,
  hideLogo: false,
};

const Header = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [logo, setLogo] = useState("");
  const [logoError, setLogoError] = useState(false);
  const [topSettings, setTopSettings] = useState(DEFAULT_SETTINGS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const mountedRef = useRef(true);

  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar();

  const quickLinks = useMemo(() => [
    { name: "Find Cars", href: "/car-for-sale", icon: FaCar },
    { name: "Car valuation", href: "/cars/valuation", icon: FaCalculator },
    { name: "Lease deals", href: "/cars/leasing", icon: FaTags },
    { name: "Vehicle Services", href: "/cars/about-us", icon: FaHandshake },
  ], []);

  const mobileMenuLinks = useMemo(() => [
    ...quickLinks,
    { name: "Login", href: "/login", icon: FaUser },
  ], [quickLinks]);

  useEffect(() => {
    // Check localStorage first for faster initialization
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setDarkMode(isDark);
    
    // Apply immediately to prevent flash
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Enhanced settings fetch with cache integration
  const fetchSettings = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setIsLoading(true);
      
      // Check cache first
      const cachedData = CacheManager.get(CACHE_KEY);
      if (cachedData) {
        setLogo(cachedData?.settings?.logo1 || "");
        setTopSettings({
          ...DEFAULT_SETTINGS,
          ...cachedData?.settings?.top,
        });
        setIsSettingsLoaded(true);
        setIsLoading(false);
        return;
      }

      // If no cache, make API request
      const response = await fetch("/api/settings/general", {
        next: { revalidate: 600 },
      });

      if (!response.ok) {
        throw new Error('Settings fetch failed');
      }

      const data = await response.json();

      if (!mountedRef.current) return;

      // Cache the response
      CacheManager.set(CACHE_KEY, data);

      const updates = {
        logo: data?.settings?.logo1 || "",
        settings: {
          ...DEFAULT_SETTINGS,
          ...data?.settings?.top,
        }
      };

      setLogo(updates.logo);
      setTopSettings(updates.settings);
      setIsSettingsLoaded(true);
      
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      
      // Try to use stale cache as fallback
      const staleCache = localStorage.getItem(CACHE_KEY);
      if (staleCache) {
        try {
          const { data } = JSON.parse(staleCache);
          if (data?.settings) {
            setLogo(data.settings.logo1 || "");
            setTopSettings({
              ...DEFAULT_SETTINGS,
              ...data.settings.top,
            });
          }
        } catch (parseError) {
          console.warn('Failed to parse stale cache data:', parseError);
        }
      }
      
      // Silently fall back to defaults
      setIsSettingsLoaded(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    
    // Use requestIdleCallback for non-critical settings
    const scheduleTask = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
    const taskId = scheduleTask(() => {
      fetchSettings();
    }, { timeout: 3000 });
    
    return () => {
      mountedRef.current = false;
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(taskId);
      } else {
        clearTimeout(taskId);
      }
    };
  }, [fetchSettings]);

  // Optimized dark mode toggle with persistence
  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Persist preference
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    
    // Apply immediately
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleSearchSidebar = useCallback(() => {
    toggleSidebar(); // Use context function
  }, [toggleSidebar]);

  const handleMobileMenuOpen = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const navigateToLogin = useCallback(() => {
    router.push("/login");
  }, [router]);

  const navigateToLikedCars = useCallback(() => {
    router.push("/liked-cars");
  }, [router]);

  const handleLogoError = useCallback(() => {
    setLogoError(true);
    setLogo("");
  }, []);

  // Optimized skeleton without animations to prevent CLS
  const LogoSkeleton = useMemo(() => (
   <div className="flex items-center space-x-3 ultraH48W200">
 <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      <div className="flex flex-col space-y-1">
        <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  ), []);

  // Memoized logo component with fixed dimensions
  const LogoComponent = useMemo(() => {
    if (topSettings.hideLogo) return null;

    if (!isSettingsLoaded) return LogoSkeleton;

    const logoContent = (
      <div className="flex items-center space-x-3">
        <div className="flex flex-col">
          <span className="bg-gradient-to-r from-gray-800 via-red-600 to-gray-800 bg-clip-text text-lg font-bold tracking-tight text-transparent dark:from-white dark:via-red-400 dark:to-white">
            WindScreen
          </span>
          <span className="text-xs font-medium text-gray-600 group-hover:text-red-600 transition-colors duration-300 dark:text-gray-400 dark:group-hover:text-red-400">
            Built to Sell Cars
          </span>
        </div>
      </div>
    );

    return (
      <Link href="/" className="flex items-center space-x-3 group">
      <div className="flex items-center minH48Unique">
  {logo && !logoError ? (
            <>
            <div className="w64h64Unique relative">
  <Image
                  src={logo}
                  alt="Logo"
                  fill
                  className="object-contain"
                  onError={handleLogoError}
                  priority
                  sizes="64px"
                />
              </div>
              {logoContent}
            </>
          ) : (
            logoContent
          )}
        </div>
      </Link>
    );
  }, [topSettings.hideLogo, isSettingsLoaded, logo, logoError, LogoSkeleton, handleLogoError]);

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50 bg-white shadow-lg backdrop-blur-lg transition-all duration-300 border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <Banner/>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-4">
          <div className="flex h-16 items-center justify-between">
            {LogoComponent}
            
            <div className="hidden items-center space-x-6 lg:flex">
              {quickLinks.map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.href} // Use href as key for better stability
                    href={link.href}
                    className="group flex items-center space-x-2 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-300 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white hover:shadow-lg hover:shadow-red-500/25 active:scale-95 dark:text-gray-300 dark:hover:text-white"
                  >
                    <IconComponent className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={navigateToLogin}
                aria-label="Login"
                className={`hidden items-center space-x-2 rounded-xl bg-gray-100 px-4 py-3 text-gray-600 transition-all duration-300 hover:scale-105 hover:bg-gray-200 hover:text-red-600 focus:outline-none focus:ring-0 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-red-600 lg:flex ${isLoading ? 'opacity-75' : 'opacity-100'}`}
              >
                <FaUser className="h-5 w-5" />
                <span className="text-sm font-medium">Login</span>
              </button>
              {/* Mobile Menu Toggle (Hamburger) - Visible on smaller screens */}
              <button
                onClick={handleMobileMenuOpen}
                aria-label="Open Menu"
                className="group relative rounded-xl bg-gray-100 p-3 transition-all duration-300 hover:scale-105 hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 hover:shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-white lg:hidden dark:bg-gray-800 dark:focus:ring-offset-gray-900"
              >
                <svg
                  className="h-5 w-5 text-gray-700 transition-colors duration-300 group-hover:text-white dark:text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Search Button - Hidden on smaller screens */}
              <button
                onClick={toggleSearchSidebar}
                aria-label="Open Search"
                className="group relative hidden rounded-xl bg-gray-100 p-3 transition-all duration-300 hover:scale-105 hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 hover:shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-white lg:block dark:bg-gray-800 dark:focus:ring-offset-gray-900"
              >
                <FaSearch className="h-5 w-5 text-gray-700 transition-colors duration-300 group-hover:text-white dark:text-gray-300" />
              </button>

              {!topSettings.hideFavourite && (
                <button
                  onClick={navigateToLikedCars}
                  aria-label="Liked Cars"
                  className={`group relative hidden rounded-xl bg-gray-100 p-3 transition-all duration-300 hover:scale-105 hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 hover:shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-white md:flex dark:bg-gray-800 dark:focus:ring-offset-gray-900 ${isLoading ? 'opacity-75' : 'opacity-100'}`}
                >
                  <FaHeart className="h-5 w-5 text-gray-700 transition-colors duration-300 group-hover:text-white dark:text-gray-300" />
                </button>
              )}
              
              <div className="hidden items-center space-x-3 md:flex">
                {!topSettings.hideDarkMode && (
                  <button
                    onClick={toggleDarkMode}
                    className={`group relative rounded-xl bg-gray-100 p-3 text-gray-700 ring-1 ring-gray-200 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 hover:ring-red-500/50 hover:shadow-lg hover:shadow-red-500/25 hover:text-white dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 ${isLoading ? 'opacity-75' : 'opacity-100'}`}
                    aria-label="Toggle dark mode"
                  >
                    {darkMode ? (
                      <FaSun className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    ) : (
                      <FaMoon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    )}
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-3 md:hidden">
                {!topSettings.hideDarkMode && (
                  <button
                    onClick={toggleDarkMode}
                    className={`group rounded-xl bg-gray-100 p-3 text-gray-700 ring-1 ring-gray-200 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 hover:ring-red-500/50 hover:text-white dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 ${isLoading ? 'opacity-75' : 'opacity-100'}`}
                    aria-label="Toggle dark mode"
                  >
                    {darkMode ? (
                      <FaSun className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    ) : (
                      <FaMoon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Quick Links Menu Overlay */}
      {isMobileMenuOpen && (
        <div
  className="mobileMenuOverlay fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
  onClick={handleMobileMenuClose}
/>

      )}
      
      {/* Mobile Quick Links Menu */}
     <div
  className={`mobileMenuDrawer fixed left-0 top-0 z-[60] h-full w-full max-w-xs overflow-y-auto bg-white shadow-2xl dark:bg-gray-900 scrollbar-hide lg:hidden border-r border-gray-200 dark:border-gray-700 ${
    isMobileMenuOpen ? "menuOpen" : "menuClosed"
  }`}
>

        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
            <h2 className="bg-gradient-to-r from-gray-800 via-red-600 to-gray-800 bg-clip-text text-lg font-semibold text-transparent dark:from-white dark:via-red-400 dark:to-gray-200">
              Quick Links
            </h2>
            <button
              onClick={handleMobileMenuClose}
              aria-label="Close Menu"
              className="rounded-lg p-2 text-gray-600 transition-all duration-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/50 dark:text-gray-400 dark:hover:from-red-900/20 dark:hover:to-red-800/20 dark:hover:text-red-400"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex-1 space-y-2 p-4">
            {mobileMenuLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.href} // Use href as key for better stability
                  href={link.href}
                  onClick={handleMobileMenuClose} // Close menu on link click
                  className="flex items-center space-x-3 rounded-lg px-3 py-2 text-base font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-red-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-red-500"
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
          
          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Professional Car Services
              </p>
            </div>
          </div>
        </div>
      </div>
      <CarSearchSidebar />
    </>
  );
};

export default Header;