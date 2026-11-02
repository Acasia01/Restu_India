import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../../../services/api";
import ImageUploader from "../../components/ImageUploader";
import Spinner from "../../components/Spinner";
import { API_BASE, getImageUrl } from "../../utils/adminUtils";
import "./CategoryTab.css";

const EMPTY_CATEGORY = {
  name: "",
  slug: "",
  description: "",
  image: "",
};

export default function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_CATEGORY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);

    Promise.all([
      api.get("/categories"),
      api.get("/products?limit=1000&includeInactive=true"),
    ])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data);

        const counts = {};
        (prodRes.data.products || []).forEach((p) => {
          const id = p.category?._id || p.category;
          if (id) counts[id] = (counts[id] || 0) + 1;
        });

        setProductCounts(counts);
      })
      .catch(() => toast.error("Failed to load categories"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setForm(EMPTY_CATEGORY);
    setModal("add");
  };

  const deleteCategory = async (c) => {
      const count = productCounts[c._id] || 0;

      const warning =
        count > 0
          ? `"${c.name}" has ${count} product(s) assigned to it. Deleting it will remove the category association from those products. Continue?`
          : `Delete category "${c.name}"?`;

      if (!window.confirm(warning)) return;

      try {
        await api.delete(`/categories/${c._id}`);

        toast.success("Category deleted");

        load();
      } catch (e) {
        toast.error(
          e.response?.data?.message || "Delete failed"
        );
      }
  };

  const openEdit = (c) => {
    setForm({
      name: c.name || "",
      slug: c.slug || "",
      description: c.description || "",
      image: c.image || "",
    });
    setModal(c);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description,
        image: form.image,
      };

      if (modal === "add") {
        await api.post("/categories", payload);
        toast.success("Category created");
      } else {
        await api.patch(`/categories/${modal._id}`, payload);
        toast.success("Category updated");
      }

      setModal(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.slug || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="category-toolbar">
        <input
          className="category-search"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button className="add-category-btn" onClick={openAdd}>
          + Add Category
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="table-wrapper">
          <table className="category-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Products</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((c, i) => (
                <tr key={c._id} className={i % 2 ? "alt-row" : ""}>
                  <td>
                    <div className="category-info">
                      {c.image ? (
                        <>
                          <img
                            src={getImageUrl(c.image)}
                            alt={c.name}
                            className="category-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const fallback = e.target.parentElement.querySelector('.category-placeholder-fallback');
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="category-placeholder-fallback" style={{ display: 'none', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', width: '40px', height: '40px', borderRadius: '6px' }}>📂</div>
                        </>
                      ) : (
                        <div className="category-placeholder">📂</div>
                      )}

                      <span className="category-name">{c.name}</span>
                    </div>
                  </td>

                  <td className="slug-cell"><span className="table-text-val">{c.slug}</span></td>

                  <td>
                    <span className="description-cell">
                      {c.description || "—"}
                    </span>
                  </td>

                  <td>
                    <span className="product-count">
                      {productCounts[c._id] || 0}
                    </span>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn" onClick={() => openEdit(c)}>Edit</button>
                      <button className="delete-btn" onClick={() => deleteCategory(c)}>Delete</button>
                    </div>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <p className="empty-message">No categories found.</p>
          )}
        </div>
      )}

      {modal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="modal-content">
            <h2 className="modal-title">
              {modal === "add" ? "NEW CATEGORY" : "EDIT CATEGORY"}
            </h2>

            <div className="form-group-wrapper">
              <ImageUploader
                label="Category Image"
                single
                images={form.image ? [form.image] : []}
                onChange={(imgs) =>
                  setForm((f) => ({ ...f, image: imgs[0] || "" }))
                }
              />

              <input
                className="form-input"
                value={form.name}
                placeholder="Category Name"
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />

              <input
                className="form-input"
                value={form.slug}
                placeholder="Slug"
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }
              />

              <textarea
                className="form-textarea"
                rows="3"
                value={form.description}
                placeholder="Description"
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>

              <button
                className="save-btn"
                disabled={saving}
                onClick={save}
              >
                {saving ? "Saving..." : "Save Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}