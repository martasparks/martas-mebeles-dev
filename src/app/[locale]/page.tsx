import { HeroSection } from '@/components/homepage/hero-section';
import { FeaturedCategories } from '@/components/homepage/featured-categories';
import { FeaturedProducts } from '@/components/homepage/featured-products';
 
export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <FeaturedCategories />
      <FeaturedProducts />
    </div>
  );
}