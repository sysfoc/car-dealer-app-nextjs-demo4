"use client";

import { useState } from "react";
import { ChevronDown, Bell } from "lucide-react";
import { TbSettingsCode } from "react-icons/tb";

const Banner = () => {
  const [selectedWebsite, setSelectedWebsite] = useState("windscreen");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const websiteOptions = [
    {
      value: "cruise",
      label: "Cruise Control",
      url: "https://demo3.automotivewebsolutions.com",
    },
    {
      value: "frontseat",
      label: "Front Seat",
      url: "https://demo2.automotivewebsolutions.com",
    },
    {
      value: "windscreen",
      label: "Windscreen",
      url: "https://demo1.automotivewebsolutions.com",
    },
  ];

  const handleWebsiteChange = (option) => {
    setSelectedWebsite(option.value);
    setIsDropdownOpen(false);
    window.open(option.url, "_blank");
  };

  const selectedOption = websiteOptions.find(
    (option) => option.value === selectedWebsite,
  );

  return (
    <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-2 sm:h-16 sm:px-4">
        <div className="flex w-full items-center justify-between gap-2 sm:gap-4">
          {/* Left Section - Brand and Dropdown */}
          <div className="flex min-w-0 flex-shrink-0 items-center gap-2 sm:gap-4">
            {/* Brand */}
            <div className="flex-shrink-0">
              <h1 className="xs:text-sm text-xs font-bold tracking-wide text-white sm:text-base md:text-lg lg:text-xl xl:text-2xl">
                <span className="block text-center sm:hidden">
                  Autweb
                  <br />
                  Solutions
                </span>
                <span className="hidden sm:block">Autowebsolutions</span>
              </h1>
            </div>

            {/* Website Selector */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex min-w-[80px] items-center justify-between gap-1 rounded-md bg-slate-700 px-2 py-1.5 text-xs font-medium transition-colors duration-200 hover:bg-slate-600 sm:min-w-[120px] sm:px-3 sm:py-2 sm:text-sm"
              >
                <span className="max-w-[60px] truncate sm:max-w-[100px]">
                  {selectedOption?.label}
                </span>
                <ChevronDown
                  className={`h-3 w-3 flex-shrink-0 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-[140px] rounded-md border border-slate-600 bg-slate-700 shadow-lg sm:w-full">
                  {websiteOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleWebsiteChange(option)}
                      className="block w-full px-2 py-2 text-left text-xs transition-colors duration-150 first:rounded-t-md last:rounded-b-md hover:bg-slate-600 sm:px-3 sm:text-sm"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center Section - Theme Customization */}
          <div className="hidden flex-shrink-0 flex-col items-center text-center lg:flex">
            <div className="mb-0.5 flex items-center gap-1">
              <TbSettingsCode size={30} className=" text-green-400" />
              <h2 className="text-xl font-semibold text-white">
                Theme Customization
              </h2>
            </div>
            <p className="relative -right-12 -top-2 text-xs font-medium text-green-400">
              Get a free quote
            </p>
          </div>

          {/* Right Section */}
          <div className="flex flex-shrink-0 items-center gap-1 sm:gap-3">
            <div className="flex flex-col items-center md:flex-row md:items-start">
              <p className="text-xs font-bold text-white lg:text-sm">
                Powered by
              </p>
              <p className="text-xs font-bold text-blue-300 md:ml-1 lg:text-sm">
                Sysfoc
              </p>
            </div>

            {/* Subscribe Button / Bell Icon */}
            <div className="flex-shrink-0">
              {/* Subscribe Button - Large screens */}
              <button className="hidden items-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-purple-700 lg:inline-flex">
                Subscribe Now
              </button>

              {/* Bell Icon - Small to medium screens */}
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 transition-colors duration-200 hover:bg-purple-700 sm:h-9 sm:w-9 lg:hidden">
                <Bell className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default Banner;