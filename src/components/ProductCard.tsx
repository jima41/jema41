import { Button } from '@/components/ui/button';

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  scent: string;
  onAddToCart: (id: string) => void;
}

const ProductCard = ({ id, name, brand, price, image, scent, onAddToCart }: ProductCardProps) => {
  return (
    <div className="product-card group">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary/30 mb-4">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover img-zoom"
          loading="lazy"
        />
        {/* Glass overlay on hover */}
        <div className="absolute inset-0 glass opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button 
            variant="luxury" 
            size="default"
            onClick={() => onAddToCart(id)}
            className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
          >
            Ajouter au panier
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {brand}
        </span>
        <h3 className="font-medium text-foreground leading-tight">
          {name}
        </h3>
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm text-muted-foreground">
            {scent}
          </span>
          <span className="font-semibold text-foreground">
            {price.toFixed(2)}€
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
