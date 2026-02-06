import { useState } from 'react';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';

import perfume1 from '@/assets/perfume-1.jpg';
import perfume2 from '@/assets/perfume-2.jpg';
import perfume3 from '@/assets/perfume-3.jpg';
import perfume4 from '@/assets/perfume-4.jpg';
import perfume5 from '@/assets/perfume-5.jpg';
import perfume6 from '@/assets/perfume-6.jpg';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  scent: string;
  category: string;
}

const products: Product[] = [
  { id: '1', name: 'Éclat Doré', brand: 'Maison Rayha', price: 129.00, image: perfume1, scent: 'Gourmand', category: 'femme' },
  { id: '2', name: 'Rose Éternelle', brand: 'Atelier Noble', price: 145.00, image: perfume2, scent: 'Floral', category: 'femme' },
  { id: '3', name: 'Nuit Mystique', brand: 'Le Parfumeur', price: 98.00, image: perfume3, scent: 'Boisé', category: 'homme' },
  { id: '4', name: 'Ambre Sauvage', brand: 'Maison Rayha', price: 175.00, image: perfume4, scent: 'Oriental', category: 'unisex' },
  { id: '5', name: 'Oud Royal', brand: 'Collection Privée', price: 220.00, image: perfume5, scent: 'Oriental', category: 'unisex' },
  { id: '6', name: 'Brise Marine', brand: 'Atelier Noble', price: 89.00, image: perfume6, scent: 'Frais', category: 'homme' },
];

const categories = ['tous', 'femme', 'homme', 'unisex'];
const scents = ['tous', 'gourmand', 'floral', 'boisé', 'oriental', 'frais'];

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
}

const ProductGrid = ({ onAddToCart }: ProductGridProps) => {
  const [activeCategory, setActiveCategory] = useState('tous');
  const [activeScent, setActiveScent] = useState('tous');

  const filteredProducts = products.filter(product => {
    const categoryMatch = activeCategory === 'tous' || product.category === activeCategory;
    const scentMatch = activeScent === 'tous' || product.scent.toLowerCase() === activeScent;
    return categoryMatch && scentMatch;
  });

  const handleAddToCart = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      onAddToCart(product);
    }
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-medium mb-4">Notre Collection</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Des fragrances d'exception pour chaque personnalité
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className="capitalize"
              >
                {cat === 'tous' ? 'Tous les Parfums' : cat}
              </Button>
            ))}
          </div>

          {/* Scent Filter */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start md:ml-auto">
            {scents.map((scent) => (
              <Button
                key={scent}
                variant={activeScent === scent ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveScent(scent)}
                className="capitalize"
              >
                {scent === 'tous' ? 'Toutes notes' : scent}
              </Button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {filteredProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="animate-fade-up opacity-0"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              <ProductCard
                id={product.id}
                name={product.name}
                brand={product.brand}
                price={product.price}
                image={product.image}
                scent={product.scent}
                onAddToCart={handleAddToCart}
              />
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Aucun parfum ne correspond à vos critères
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
