"use client"

import { useState } from "react"
import "/Users/apple/Documents/GitHub/LostFoundSystem/frontend/src/styles/BrowseItems.css"


// Mock data for demonstration
const mockItems = [
  {
    id: "1",
    type: "found",
    title: "Black Wallet",
    category: "Accessories",
    location: "Central Park",
    date: "2023-05-15",
    description: "Found a black leather wallet near the fountain.",
    imageUrl: "https://via.placeholder.com/300x200",
  },
  {
    id: "2",
    type: "lost",
    title: "iPhone 13 Pro",
    category: "Electronics",
    location: "Downtown Coffee Shop",
    date: "2023-05-14",
    description: "Lost my iPhone with a blue case. Last seen at the coffee shop.",
    imageUrl: "https://via.placeholder.com/300x200",
  },
  {
    id: "3",
    type: "found",
    title: "House Keys",
    category: "Keys",
    location: "Bus Station",
    date: "2023-05-13",
    description: "Found a set of house keys with a red keychain.",
    imageUrl: "https://via.placeholder.com/300x200",
  },
  {
    id: "4",
    type: "lost",
    title: "Prescription Glasses",
    category: "Accessories",
    location: "Library",
    date: "2023-05-12",
    description: "Lost my black-framed prescription glasses in a brown case.",
    imageUrl: "https://via.placeholder.com/300x200",
  },
  {
    id: "5",
    type: "found",
    title: "Umbrella",
    category: "Accessories",
    location: "Subway Station",
    date: "2023-05-11",
    description: "Found a blue umbrella with white polka dots.",
    imageUrl: "https://via.placeholder.com/300x200",
  },
  {
    id: "6",
    type: "lost",
    title: "Laptop Bag",
    category: "Bags",
    location: "University Campus",
    date: "2023-05-10",
    description: "Lost my black laptop bag containing a MacBook and charger.",
    imageUrl: "https://via.placeholder.com/300x200",
  },
]

// Categories for filtering
const categories = ["Electronics", "Accessories", "Bags", "Keys", "Documents", "Clothing", "Jewelry", "Pets", "Other"]

export default function BrowseItems() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [distance, setDistance] = useState(5)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  // Reset filters
  const handleReset = () => {
    setSelectedCategories([])
    setDistance(5)
    setStartDate("")
    setEndDate("")
  }

  // Filter items based on active tab, search query, and selected categories
  const filteredItems = mockItems.filter((item) => {
    const matchesTab = activeTab === "all" || item.type === activeTab
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category)

    return matchesTab && matchesSearch && matchesCategory
  })

  // Sort items based on selected sort option
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    } else {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    }
  })

  return (
    <div className="browse-container">
      <h1 className="page-title">Browse Items</h1>

      <div className="search-sort-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <svg
            className="search-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        <div className="sort-filter-container">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          <button onClick={() => setShowFilters(!showFilters)} className="filter-button" aria-label="Toggle filters">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line>
              <line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-section">
            <h3 className="filter-title">Categories</h3>
            <div className="categories-grid">
              {categories.map((category) => (
                <div key={category} className="category-checkbox">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                  />
                  <label htmlFor={`category-${category}`}>{category}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3 className="filter-title">Date Range</h3>
            <div className="date-inputs">
              <div className="date-input-group">
                <label>From</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="date-input-group">
                <label>To</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="filter-section">
            <h3 className="filter-title">Distance</h3>
            <div className="distance-slider">
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={distance}
                onChange={(e) => setDistance(Number.parseInt(e.target.value))}
              />
              <div className="distance-labels">
                <span>0 km</span>
                <span>{distance} km</span>
                <span>50 km</span>
              </div>
            </div>
          </div>

          <div className="filter-actions">
            <button className="reset-button" onClick={handleReset}>
              Reset
            </button>
            <button className="apply-button">Apply Filters</button>
          </div>
        </div>
      )}

      <div className="tabs-container">
        <button className={`tab ${activeTab === "all" ? "active-tab" : ""}`} onClick={() => setActiveTab("all")}>
          All Items
        </button>
        <button className={`tab ${activeTab === "lost" ? "active-tab" : ""}`} onClick={() => setActiveTab("lost")}>
          Lost Items
        </button>
        <button className={`tab ${activeTab === "found" ? "active-tab" : ""}`} onClick={() => setActiveTab("found")}>
          Found Items
        </button>
      </div>

      {sortedItems.length > 0 ? (
        <div className="items-grid">
          {sortedItems.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-image-container">
                <img src={item.imageUrl || "/placeholder.svg"} alt={item.title} className="item-image" />
                <span className={`item-badge ${item.type === "lost" ? "lost-badge" : "found-badge"}`}>
                  {item.type === "lost" ? "Lost" : "Found"}
                </span>
              </div>
              <div className="item-content">
                <h3 className="item-title">{item.title}</h3>
                <span className="item-category">{item.category}</span>
                <p className="item-description">{item.description}</p>
                <div className="item-details">
                  <div className="item-location">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{item.location}</span>
                  </div>
                  <div className="item-date">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-items">
          <p>No items found matching your criteria.</p>
          <button
            className="clear-filters"
            onClick={() => {
              setSearchQuery("")
              setActiveTab("all")
              setSelectedCategories([])
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}

