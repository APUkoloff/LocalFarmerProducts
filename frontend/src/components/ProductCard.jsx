import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StockBadge from './StockBadge';

export default function ProductCard({ product, onAddToCart }) {
  const { t } = useTranslation();
  const inStock = product.in_stock !== false && parseFloat(product.stock_qty) > 0;

  return (
    <Card className="h-100 product-card shadow-sm">
      {product.primary_image ? (
        <Card.Img variant="top" src={product.primary_image} alt={product.name} loading="lazy" />
      ) : (
        <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: 180 }}>
          <span className="text-muted">No image</span>
        </div>
      )}
      <Card.Body className="d-flex flex-column">
        <Card.Title className="fs-6">
          <Link to={`/product/${product.slug}`} className="text-decoration-none text-dark">
            {product.name}
          </Link>
        </Card.Title>
        <div className="mb-2">
          <Badge bg="secondary">{product.category_name}</Badge>
          <StockBadge stockQty={product.stock_qty} unit={product.unit} />
        </div>
        <Card.Text className="fw-bold mt-auto">{product.price} ₽ / {product.unit_display || product.unit}</Card.Text>
        <Button
          variant="success"
          size="sm"
          disabled={!inStock}
          onClick={() => onAddToCart(product)}
        >
          {inStock ? t('catalog.addToCart') : t('catalog.outOfStock')}
        </Button>
      </Card.Body>
    </Card>
  );
}
