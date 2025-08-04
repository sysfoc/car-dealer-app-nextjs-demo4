"use client"
import { useState, useEffect } from "react"
import { Car, CarFront, CaravanIcon as Van, BatteryCharging, Wrench } from 'lucide-react'

const getInitialVisibleCount = () => {
  if (typeof window !== "undefined") {
    if (window.innerWidth < 640) {
      return 3
    } else {
      return 6
    }
  }
  return 6
}

const BrowseCars = () => {
  const allItems = [
    { category: "Automatic Cars", icon: <Car />, count: 245, popular: true },
    { category: "Family Cars", icon: <CarFront />, count: 189, popular: true },
    {
      category: "Sports Cars",
      icon: <Car />,
      count: 78,
      popular: false,
    },
    {
      category: "Electric Cars",
      icon: <BatteryCharging />,
      count: 156,
      popular: true,
    },
    {
      category: "5 Seaters",
      icon: <Van />,
      count: 234,
      popular: false,
    },
    { category: "Small Cars", icon: <Car />, count: 167, popular: false },
    {
      category: "Classic Cars",
      icon: <Van />,
      count: 45,
      popular: false,
    },
    { category: "AWD/4WD", icon: <Van />, count: 123, popular: false },
    { category: "SUV", icon: <Car />, count: 198, popular: true },
    { category: "Commercial", icon: <Car />, count: 89, popular: false },
    { category: "5 Doors", icon: <Car />, count: 201, popular: false },
    { category: "Low Priced Cars", icon: <Car />, count: 178, popular: true },
    {
      category: "Low Mileage Cars",
      icon: <CarFront />,
      count: 134,
      popular: false,
    },
    {
      category: "Hybrid Cars",
      icon: <Car />,
      count: 92,
      popular: false,
    },
    { category: "Diesel Cars", icon: <Car />, count: 145, popular: false },
    { category: "7 Seaters", icon: <Van />, count: 87, popular: false },
    {
      category: "Modified Cars",
      icon: <Wrench />,
      count: 34,
      popular: false,
    },
    { category: "Vintage Models", icon: <Car />, count: 23, popular: false },
  ]

  const [filteredItems, setFilteredItems] = useState(allItems)
  const [isLoading, setIsLoading] = useState(false)
  const [visibleCount, setVisibleCount] = useState(6)

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(3)
      } else {
        setVisibleCount(6)
      }
    }

    updateVisibleCount() // Run on mount
    window.addEventListener("resize", updateVisibleCount)
    return () => window.removeEventListener("resize", updateVisibleCount)
  }, [])
  
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setFilteredItems(allItems)
      setIsLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const CategoryCard = ({ item, index }) => (
  <div className="group relative overflow-hidden rounded-xl border border-gray-200 hover:border-red-500 dark:border-gray-700 dark:hover:border-red-500 bg-white dark:bg-gray-800 p-1 sm:p-4 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-xl">
    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-50/50 via-transparent to-red-100/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-red-900/20 dark:via-transparent dark:to-red-800/20"></div>
    
    {item.popular && (
      <div className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
    )}
    
    <div className="relative z-10 flex items-center space-x-3">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/50 dark:to-red-800/50 transition-transform duration-300 group-hover:scale-110">
        <div className="text-xl text-gray-600 group-hover:text-red-600 dark:text-red-400 dark:group-hover:text-red-500 transition-colors duration-300">
          {item.icon}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-gray-800 group-hover:text-red-600 dark:text-gray-100 dark:group-hover:text-red-400 transition-colors duration-300">
          {item.category}
        </h3>
        <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
          {item.count} available
        </p>
      </div>
    </div>
  </div>
)

  return (
    <section className="relative sm:mx-4 my-6 overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 px-3 sm:px-6 py-8 shadow-xl">
      <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200/20 dark:bg-blue-900/20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-1/2 translate-y-1/2 rounded-full bg-purple-200/20 dark:bg-purple-900/20 blur-3xl"></div>
      
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h3 className="mb-4 text-2xl font-bold leading-tight text-app-text dark:text-gray-100 md:text-4xl lg:text-5xl">
            Cars Categories
          </h3>
          <p className="mb-2 mx-auto max-w-lg text-sm text-app-text/80 dark:text-gray-300">
            Perfect vehicle from our curated collection
          </p>
          <div className="w-16 h-1.5 mx-auto rounded-full bg-red-600"></div>
        </div>
        
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-app-text dark:text-gray-300">
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                <span>Loading categories...</span>
              </span>
            ) : (
              `${filteredItems.length} categories available`
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
          {filteredItems.length > 0 ? (
            filteredItems
              .slice(0, visibleCount)
              .map((item, index) => <CategoryCard key={`${item.category}-${index}`} item={item} index={index} />)
          ) : (
            <div className="col-span-full py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                <Car className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-app-text dark:text-gray-200">
                No categories found
              </h3>
              <p className="mb-4 text-app-text/70 dark:text-gray-400">
                There are no car categories to display.
              </p>
            </div>
          )}
        </div>
        
        {filteredItems.length > getInitialVisibleCount() && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                if (visibleCount >= filteredItems.length) {
                  setVisibleCount(getInitialVisibleCount())
                } else {
                  setVisibleCount((prev) => prev + 6)
                }
              }}
              className="rounded-lg bg-red-600 hover:bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-300"
            >
              {visibleCount >= filteredItems.length ? "See Less" : "See More"}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default BrowseCars