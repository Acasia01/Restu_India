import { useEffect } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Hero from "../../Components/Hero/Hero";
import Showcase from "../../Components/Showcase/Showcase";
import Products from '../Products/Products';
import Contact from "../Contact/Contact";
import Footer from "../../Components/Footer/Footer";
import './Homepage.css'
import Why from "../../Components/Why/Why";
import '../../styles/base.css'
import Category from "../../Components/Categories/category";
import StatsBand from "../../Components/Showcase/StatsBand";
import {
  updateSEO,
  getOrganizationSchema,
  getLocalBusinessSchema,
  getWebSiteSchema,
  getFAQPageSchema
} from "../../utils/seo";

const HOME_FAQS = [
  {
    question: "What types of hospital furniture does Resatu India manufacture?",
    answer: "Resatu India manufactures electric ICU beds, manual hospital beds, OT tables, ward furniture, medical crash carts, examination tables, wheelchairs, and healthcare mattresses."
  },
  {
    question: "Do you supply hospital equipment pan-India?",
    answer: "Yes, Resatu India supplies hospital furniture and medical equipment across all states in India with comprehensive logistics and installation support."
  },
  {
    question: "Can I get custom hospital furniture setups for new clinic or hospital projects?",
    answer: "Yes, we provide end-to-end custom hospital furniture fabrication and bulk project quotes tailored to specific hospital ward and OT requirements."
  }
];

export default function HomePage() {
  useEffect(() => {
    updateSEO({
      title: "Home",
      description: "Resatu India - Certified manufacturer & supplier of Hospital Beds, Operation Theatre (OT) Equipment, Ward Furniture, and Healthcare Solutions in India.",
      keywords: "hospital furniture, hospital beds, electric ICU bed, OT equipment, operation theatre table, ward furniture, medical mattresses, hospital equipment manufacturer India",
      schema: [
        getOrganizationSchema(),
        getLocalBusinessSchema(),
        getWebSiteSchema(),
        getFAQPageSchema(HOME_FAQS)
      ]
    });
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <Showcase />
      <Category/>
      <Why/>
      <StatsBand />
      <Footer />
    </>
  );
}