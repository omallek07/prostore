import ProductCarousel from '@/components/shared/product/product-carousel';
import ProductList from '@/components/shared/product/product-list';
import {
  getFeaturedProducts,
  getLatestProducts,
} from '@/lib/actions/product.actions';
import { LATEST_PRODUCTS_LIMIT } from '@/lib/constants';

const Homepage = async () => {
  const latestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      {featuredProducts.length > 0 ? (
        <ProductCarousel data={featuredProducts} />
      ) : null}
      <ProductList
        data={latestProducts}
        title='Newest Arrivals'
        limit={LATEST_PRODUCTS_LIMIT}
      />
    </>
  );
};

export default Homepage;
