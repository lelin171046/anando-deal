import { formatBdt } from '@anando-deal/shared';
import { Heart, ImageOff, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import type { ProductDto } from '@/lib/types';
import { useCart } from '@/stores/cart';
import { useWishlist } from '@/stores/wishlist';

export function ProductCard({ product }: { product: ProductDto }) {
  const image = product.images[0];
  const category = typeof product.category === 'object' ? product.category : null;
  const saleVariants = product.variants.filter((variant) => variant.isOnSale);
  const oldPrice = saleVariants.length
    ? Math.min(
        ...saleVariants.map((variant) =>
          variant.compareAtPrice && variant.compareAtPrice > variant.price
            ? variant.compareAtPrice
            : variant.price,
        ),
      )
    : undefined;
  const discount = saleVariants.length
    ? Math.max(...saleVariants.map((variant) => variant.discountPercent))
    : 0;
  const availableVariant = product.variants.find((variant) => variant.stock > 0);
  const isWished = useWishlist((state) =>
    state.items.some((item) => item.productId === product._id),
  );
  const toggleWishlist = useWishlist((state) => state.toggleItem);
  const addToCart = useCart((state) => state.addItem);
  const navigate = useNavigate();

  const cartItem = availableVariant
    ? {
        productId: product._id,
        slug: product.slug,
        name: product.name,
        image: image?.url ?? '',
        variantSku: availableVariant.sku,
        variantLabel: availableVariant.label,
        price: availableVariant.effectivePrice,
        maxStock: availableVariant.stock,
      }
    : null;

  const buyNow = () => {
    if (!cartItem) return;
    addToCart(cartItem);
    navigate('/checkout');
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-lg hover:shadow-primary/10">
      <div className="absolute right-3 top-3 z-10 flex gap-2">
        <button
          type="button"
          aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isWished}
          onClick={() =>
            toggleWishlist({
              productId: product._id,
              slug: product.slug,
              name: product.name,
              image: image?.url ?? '',
              price: product.effectiveBasePrice,
            })
          }
          className="grid h-9 w-9 place-items-center rounded-full border bg-background/90 text-muted-foreground shadow-sm transition-colors hover:text-white"
        >
          <Heart className={isWished ? 'h-4 w-4 fill-white text-white' : 'h-4 w-4'} />
        </button>
      </div>

      <Link to={`/product/${product.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-square shrink-0 overflow-hidden bg-secondary">
          {image?.url ? (
            <img
              src={image.url}
              alt={image.alt || product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">
              <ImageOff className="h-10 w-10" />
            </div>
          )}

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {discount > 0 && <Badge variant="accent">-{discount}%</Badge>}
            {product.badge && <Badge variant="outline">{product.badge}</Badge>}
            {product.totalStock === 0 && <Badge variant="outline">Sold out</Badge>}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className="min-h-4 text-[11px] font-semibold uppercase leading-4 tracking-[0.14em] text-muted-foreground">
            {category?.name ?? '\u00A0'}
          </p>
          <h3 className="mt-1.5 line-clamp-2 min-h-11 text-base font-semibold leading-snug">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
            {product.shortDescription || '\u00A0'}
          </p>

          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            <div>
              <p className="text-[11px] text-muted-foreground">
                {oldPrice ? 'Sale price' : 'From'}
              </p>
              <div className="flex flex-wrap items-baseline gap-2">
                <p className="text-lg font-semibold text-primary">
                  {formatBdt(product.effectiveBasePrice)}
                </p>
                {oldPrice && (
                  <p className="text-xs text-muted-foreground line-through">
                    {formatBdt(oldPrice)}
                  </p>
                )}
              </div>
              {product.salesCount > 0 && (
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {product.salesCount} sold
                </p>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {product.variants.length} {product.variants.length === 1 ? 'option' : 'options'}
            </span>
          </div>
        </div>
      </Link>

      <div className="flex gap-2 border-t border-border/70 p-3">
        {cartItem ? (
          <>
            <button
              type="button"
              onClick={() => addToCart(cartItem)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary bg-background px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
            >
              <ShoppingBag className="h-4 w-4" />
              Add to cart
            </button>
            <button
              type="button"
              onClick={buyNow}
              className="flex flex-1 items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Buy now
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground opacity-50"
          >
            Sold out
          </button>
        )}
      </div>
    </article>
  );
}
