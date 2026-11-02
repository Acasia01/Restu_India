import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./category.css";
import api from "../../services/api";
import { API_BASE, getImageUrl } from "../../Pages/Admin/utils/adminUtils";

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("categories/")
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load categories.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <section className="section category-section" id="categories">
      <div className="section-title">Our Categories</div>

      <div className="section-sub">
        Explore our wide range of hospital furniture and medical equipment
        categories
      </div>

      <div className="category-grid">
        {loading ? (
          <div className="loading-text">Loading categories...</div>
        ) : error ? (
          <div className="error-text">{error}</div>
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <div
              className="category-card"
              key={category.id}
              onClick={() => handleCategoryClick(category.name)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCategoryClick(category.name);
                }
              }}
            >
              <div className="category-icon">
                {category.image ? (
                  <img
                    src={getImageUrl(category.image)}
                    alt={category.name}
                    className="category-icon-img"
                    onError={(e) => { 
                      e.target.style.display = 'none'; 
                      const fallback = e.target.parentElement.querySelector('.category-icon-fallback');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span className="category-icon-fallback" style={{ display: category.image ? 'none' : 'flex' }}>
                  🏥
                </span>
              </div>

              <h3>{category.name}</h3>

              <p>
                Premium quality medical and hospital products available in this
                category.
              </p>
            </div>
          ))
        ) : (
          <div className="no-category">
            No categories available.
          </div>
        )}
      </div>
    </section>
  );
}