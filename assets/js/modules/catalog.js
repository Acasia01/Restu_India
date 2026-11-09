import { categories, products } from "../data.js";

function productCategoryLabel(categoryId) {
  const match = categories.find((category) => category.id === categoryId);
  return match ? match.label : categoryId;
}

function createFilterButton(category, activeCategory, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `filter-chip${category.id === activeCategory ? " is-active" : ""}`;
  button.textContent = category.label;
  button.addEventListener("click", () => onClick(category.id));
  return button;
}

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const top = document.createElement("div");
  top.className = "product-top";

  const badge = document.createElement("span");
  badge.className = "product-badge";
  badge.textContent = productCategoryLabel(product.category);

  const code = document.createElement("span");
  code.className = "product-code";
  code.textContent = product.code;

  top.append(badge, code);

  const title = document.createElement("h3");
  title.textContent = product.name;

  const note = document.createElement("p");
  note.textContent = product.note;

  card.append(top, title, note);
  return card;
}

export function createCatalog() {
  const filtersRoot = document.querySelector("#category-filters");
  const gridRoot = document.querySelector("#product-grid");

  if (!filtersRoot || !gridRoot) {
    return;
  }

  let activeCategory = "all";

  function render() {
    filtersRoot.innerHTML = "";
    categories.forEach((category) => {
      filtersRoot.append(createFilterButton(category, activeCategory, updateCategory));
    });

    gridRoot.innerHTML = "";
    const visibleProducts = activeCategory === "all"
      ? products
      : products.filter((product) => product.category === activeCategory);

    visibleProducts.forEach((product) => {
      gridRoot.append(createProductCard(product));
    });
  }

  function updateCategory(nextCategory) {
    activeCategory = nextCategory;
    render();
  }

  render();
}
