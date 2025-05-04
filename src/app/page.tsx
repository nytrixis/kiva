import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import FeaturedCategories from "@/components/FeaturedCategories";
import RecentlyViewed from "@/components/RecentlyViewed";
import ArtisanSpotlight from "@/components/ArtisanSpotlight";
import TrendingProducts from "@/components/TrendingProducts";
import SustainabilityImpact from "@/components/SustainabilityImpact";
import CustomerTestimonials from "@/components/CustomerTestimonials";


export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <FeaturedCategories />
      <RecentlyViewed />
      <ArtisanSpotlight />
      <TrendingProducts />
      <SustainabilityImpact />
      <CustomerTestimonials />
      <Footer />
    </main>
  );
}
