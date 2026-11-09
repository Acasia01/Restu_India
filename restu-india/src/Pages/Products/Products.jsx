import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "../../Components/ProductCard/ProductCard";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import api from "../../services/api";
import "./Products.css";

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-img" />
    <div className="skeleton-body">
      <div className="skeleton-line short" />
      <div className="skeleton-line med" />
      <div className="skeleton-line short" />
    </div>
  </div>
);

const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-icon">
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    </div>
    <h3>No matching products found</h3>
    <p>We couldn't find any products matching your selection. Try adjusting your search query or filters.</p>
  </div>
);

import { updateSEO, getBreadcrumbSchema } from "../../utils/seo";

export default function Products() {
  const location = useLocation();
  const tabBarRef = useRef(null);

  const categoryFromUrl = new URLSearchParams(location.search).get("category");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(
    categoryFromUrl || "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const selectedCatObj = categories.find(c => String(c.id) === String(activeCategory) || c.slug === activeCategory);
    const catName = selectedCatObj ? selectedCatObj.name : "All Products";

    const breadcrumbs = [
      { name: "Home", url: "/" },
      { name: "Products", url: "/products" }
    ];

    if (selectedCatObj && selectedCatObj.name) {
      breadcrumbs.push({
        name: selectedCatObj.name,
        url: `/products?category=${selectedCatObj.slug || selectedCatObj.id}`
      });
    }

    updateSEO({
      title: `${catName} Catalog`,
      description: `Explore ${catName} by Resatu India. Certified hospital beds, OT tables, ward furniture, and medical accessories.`,
      keywords: `${catName}, hospital equipment catalog, medical furniture, buy medical beds India`,
      schema: [
        getBreadcrumbSchema(breadcrumbs),
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": `${catName} - Resatu India Hospital Equipment`,
          "description": `Browse ${catName} manufactured and supplied by Resatu India.`,
          "url": window.location.href
        }
      ]
    });
  }, [activeCategory, categories]);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      api.get("products/"),
      api.get("categories/"),
    ])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data.products || []);
        setCategories(catRes.data);
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, []);


  const getCategoryCount = (catName) => {
    if (catName === "all") return products.length;
    return products.filter(
      (p) => p.category?.name?.toLowerCase() === catName.toLowerCase()
    ).length;
  };

  const uniqueTags = Array.from(
    new Set(products.flatMap((p) => p.tags || []))
  );

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const resetFilters = () => {
    setActiveCategory("all");
    setSearchQuery("");
    setShowNewOnly(false);
    setShowFeaturedOnly(false);
    setSelectedTags([]);
    setSortBy("default");
  };

  const hasActiveFilters =
    activeCategory !== "all" ||
    searchQuery !== "" ||
    showNewOnly ||
    showFeaturedOnly ||
    selectedTags.length > 0 ||
    sortBy !== "default";

  const handleTabClick = (val) => {
    setActiveCategory(val);

    setTimeout(() => {
      const activeBtn =
        tabBarRef.current?.querySelector(".tab.active");

      activeBtn?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }, 50);
  };

  // 1. Category filter
  let processed = activeCategory === "all"
    ? products
    : products.filter(
      (p) =>
        p.category?.name?.toLowerCase() === activeCategory.toLowerCase()
    );

  // 2. Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    processed = processed.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.code || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q)
    );
  }

  // 3. Status filters
  if (showNewOnly) {
    processed = processed.filter((p) => p.isNew);
  }
  if (showFeaturedOnly) {
    processed = processed.filter((p) => p.isFeatured);
  }

  // 4. Tag filters
  if (selectedTags.length > 0) {
    processed = processed.filter((p) =>
      selectedTags.every((t) => p.tags?.includes(t))
    );
  }

  // 5. Sorting (alphabetical A-Z)
  if (sortBy === "name-asc") {
    processed = [...processed].sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="products-page">
      <Navbar />

      {/* PREMIUM HERO HEADER *
      <div className="catalog-hero-header">
        <div className="catalog-hero-inner">
          <h1 className="catalog-title">Premium Hospital Solutions</h1>
          <p className="catalog-subtitle">
            Explore our state-of-the-art medical equipment and high-quality fowler beds designed for clinical reliability.
          </p>
        </div>
      </div>
      */}

      <div className="catalog-container">
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="catalog-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Categories</h3>
            <div className="sidebar-menu">
              <button
                className={`sidebar-link ${activeCategory === "all" ? "active" : ""}`}
                onClick={() => handleTabClick("all")}
              >
                <span className="sidebar-link-text">📂 All Products</span>
                <span className="sidebar-link-count">{getCategoryCount("all")}</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`sidebar-link ${activeCategory === cat.name.toLowerCase() ? "active" : ""
                    }`}
                  onClick={() => handleTabClick(cat.name.toLowerCase())}
                >
                  <span className="sidebar-link-text">⚡ {cat.name}</span>
                  <span className="sidebar-link-count">{getCategoryCount(cat.name)}</span>
                </button>
              ))}
            </div>

            {/* STATUS FILTERS */}
            <h3 className="sidebar-title" style={{ marginTop: "1.5rem" }}>Filter By</h3>
            <div className="sidebar-filters-group">
              <label className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={showFeaturedOnly}
                  onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                />
                <span>Featured Items</span>
              </label>
              <label className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={showNewOnly}
                  onChange={(e) => setShowNewOnly(e.target.checked)}
                />
                <span>New Arrivals</span>
              </label>
            </div>

            {/* POPULAR TAGS */}
            {uniqueTags.length > 0 && (
              <>
                <h3 className="sidebar-title" style={{ marginTop: "1.5rem" }}>Popular Tags</h3>
                <div className="sidebar-tags">
                  {uniqueTags.map((tag) => (
                    <button
                      key={tag}
                      className={`filter-tag-pill ${selectedTags.includes(tag) ? "active" : ""}`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* RESET BUTTON */}
            {hasActiveFilters && (
              <button className="sidebar-reset-btn" onClick={resetFilters}>
                Clear All Filters
              </button>
            )}
          </div>
        </aside>

        {/* MAIN PRODUCT AREA */}
        <main className="catalog-content">
          {/* SEARCH & SORT TOOLBAR */}
          <div className="catalog-toolbar">
            <div className="catalog-search-box">
              <svg
                className="search-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search products by name, code or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="search-clear-btn" onClick={() => setSearchQuery("")}>
                  ×
                </button>
              )}
            </div>

            <div className="catalog-sort-box">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="default">Sort: Recommended</option>
                <option value="name-asc">Product Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* MOBILE FILTERS TOGGLE PANEL */}
          <div className="mobile-filters-panel">
            <button
              className={`mobile-filter-toggle-btn ${showMobileFilters ? "open" : ""}`}
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <span>{showMobileFilters ? "Hide Filters" : "Show Filters"}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {showMobileFilters && (
              <div className="mobile-filters-expanded">
                <div className="mobile-filter-section">
                  <h4>Filter By</h4>
                  <div className="mobile-checkboxes-row">
                    <label className="filter-checkbox-label">
                      <input
                        type="checkbox"
                        checked={showFeaturedOnly}
                        onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                      />
                      <span>Featured</span>
                    </label>
                    <label className="filter-checkbox-label">
                      <input
                        type="checkbox"
                        checked={showNewOnly}
                        onChange={(e) => setShowNewOnly(e.target.checked)}
                      />
                      <span>New</span>
                    </label>
                  </div>
                </div>

                {uniqueTags.length > 0 && (
                  <div className="mobile-filter-section">
                    <h4>Tags</h4>
                    <div className="mobile-tags-row">
                      {uniqueTags.map((tag) => (
                        <button
                          key={tag}
                          className={`filter-tag-pill ${selectedTags.includes(tag) ? "active" : ""}`}
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {hasActiveFilters && (
                  <button className="mobile-reset-btn" onClick={resetFilters}>
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* MOBILE TABS (HIDDEN ON DESKTOP) */}
          <div className="mobile-tabs-container">
            <div className="tab-scroll-wrapper">
              <div className="tab-bar" ref={tabBarRef}>
                <button
                  className={`tab ${activeCategory === "all" ? "active" : ""}`}
                  onClick={() => handleTabClick("all")}
                >
                  All Products ({getCategoryCount("all")})
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`tab ${activeCategory === cat.name.toLowerCase() ? "active" : ""
                      }`}
                    onClick={() => handleTabClick(cat.name.toLowerCase())}
                  >
                    {cat.name} ({getCategoryCount(cat.name)})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RESULTS SUMMARY BAR */}
          {!loading && (
            <div className="catalog-results-summary">
              <span className="summary-text">
                Found <strong>{processed.length}</strong> product{processed.length !== 1 ? "s" : ""}
                {activeCategory !== "all" && ` in ${categories.find(
                  (c) => c.name.toLowerCase() === activeCategory
                )?.name || activeCategory
                  }`}
                {searchQuery.trim() && ` matching "${searchQuery}"`}
              </span>
            </div>
          )}

          {/* PRODUCTS GRID */}
          <div className="products-grid-wrapper">
            {loading ? (
              <div className="products-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : processed.length > 0 ? (
              <div className="products-grid">
                {processed.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}