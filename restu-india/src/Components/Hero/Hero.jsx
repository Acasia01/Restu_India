import "./Hero.css";
import { useNavigate } from "react-router-dom";

// Professional inline SVG icons - no emojis
const BedIcon = () => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width="36"
    height="36"
  >
    <rect
      x="4"
      y="28"
      width="40"
      height="8"
      rx="2"
      fill="rgba(255,255,255,0.25)"
      stroke="rgba(255,255,255,0.6)"
      strokeWidth="1.5"
    />
    <rect
      x="4"
      y="20"
      width="40"
      height="9"
      rx="2"
      fill="rgba(255,255,255,0.15)"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="1.5"
    />
    <rect
      x="8"
      y="14"
      width="14"
      height="7"
      rx="2"
      fill="rgba(125,211,252,0.4)"
      stroke="rgba(125,211,252,0.8)"
      strokeWidth="1.5"
    />
    <line
      x1="4"
      y1="36"
      x2="4"
      y2="42"
      stroke="rgba(255,255,255,0.6)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="44"
      y1="36"
      x2="44"
      y2="42"
      stroke="rgba(255,255,255,0.6)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const DeliveryIcon = () => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width="36"
    height="36"
  >
    <path
      d="M4 14 L4 34 L32 34 L32 14 Z"
      fill="rgba(255,255,255,0.15)"
      stroke="rgba(255,255,255,0.5)"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M32 20 L44 24 L44 34 L32 34 Z"
      fill="rgba(125,211,252,0.2)"
      stroke="rgba(125,211,252,0.7)"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="36"
      r="4"
      fill="rgba(255,255,255,0.2)"
      stroke="rgba(255,255,255,0.8)"
      strokeWidth="1.5"
    />
    <circle
      cx="36"
      cy="36"
      r="4"
      fill="rgba(255,255,255,0.2)"
      stroke="rgba(255,255,255,0.8)"
      strokeWidth="1.5"
    />
    <line
      x1="10"
      y1="22"
      x2="22"
      y2="22"
      stroke="rgba(255,255,255,0.5)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="10"
      y1="27"
      x2="18"
      y2="27"
      stroke="rgba(255,255,255,0.35)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const ISOIcon = () => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width="36"
    height="36"
  >
    <path
      d="M24 4 L28.5 14.5 L40 15.5 L31.5 23.5 L34 35 L24 29 L14 35 L16.5 23.5 L8 15.5 L19.5 14.5 Z"
      fill="rgba(125,211,252,0.25)"
      stroke="rgba(125,211,252,0.9)"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M18 24 L22 28 L30 20"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CustomIcon = () => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width="36"
    height="36"
  >
    <circle
      cx="24"
      cy="24"
      r="6"
      fill="rgba(125,211,252,0.3)"
      stroke="rgba(125,211,252,0.8)"
      strokeWidth="1.5"
    />
    <path
      d="M24 4 L24 10"
      stroke="rgba(255,255,255,0.6)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M24 38 L24 44"
      stroke="rgba(255,255,255,0.6)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M4 24 L10 24"
      stroke="rgba(255,255,255,0.6)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M38 24 L44 24"
      stroke="rgba(255,255,255,0.6)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M9.4 9.4 L13.6 13.6"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M34.4 34.4 L38.6 38.6"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M38.6 9.4 L34.4 13.6"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M13.6 34.4 L9.4 38.6"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const cards = [
  { icon: <BedIcon />, val: "150+", label: "Products" },
  { icon: <DeliveryIcon />, val: "Pan India", label: "Delivery" },
  { icon: <ISOIcon />, val: "ISO", label: "Quality Assured" },
  { icon: <CustomIcon />, val: "Custom", label: "Orders Welcome" },
];

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-text">

        <h1>
          Premium Hospital Furniture & Mattresses
        </h1>

        <p>
          Trusted manufacturer of high-quality hospital furniture and medical
          equipment. Serving healthcare facilities across India with comfort
          and reliability.
        </p>

        <div className="hero-btns">
          <button
            className="btn-primary"
            onClick={() => {
              navigate("/products");
              setTimeout(() => {
                document
                  .getElementById("products")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          >
            Browse Products
          </button>

          <button
            className="btn-outline"
            onClick={() => navigate("/contact")}
          >
            Contact Us
          </button>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-cards">
          {cards.map((card, i) => (
            <div className="hero-card" key={i}>
              <div className="icon">{card.icon}</div>
              <div className="val">{card.val}</div>
              <div className="label">{card.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}