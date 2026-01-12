import ProductCard from './product-card';

import { Product } from '@/types';

type ProductListProps = {
  data: Product[];
  title?: string;
  limit?: number;
};

function ProductList({ data, title, limit }: ProductListProps) {
  const limitedData = limit ? data.slice(0, limit) : data;
  return (
    <div className='my-10'>
      {title ? <h2 className='h2-bold mb-4'>{title}</h2> : null}
      {limitedData.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {limitedData.map((product: Product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
      ) : (
        <div>
          <p>No products found</p>
        </div>
      )}
    </div>
  );
}

export default ProductList;
