// components/menu/CategorySection.tsx
import { ProductCard } from './ProductCard';

interface CategorySectionProps {
  category: string;
  products: any[];
  onAddToCart: (product: any) => void;
}

export function CategorySection({ category, products, onAddToCart }: CategorySectionProps) {
  const categoryId = category.replace(/\s+/g, '-');

  return (
    <section
      id={categoryId}
      className="mb-12 scroll-mt-28"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        {category}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={() => onAddToCart(product)}
          />
        ))}
      </div>
    </section>
  );
}