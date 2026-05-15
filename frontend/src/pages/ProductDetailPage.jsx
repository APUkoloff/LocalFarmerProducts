import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { productsApi } from '../services/api';
import { useCart } from '../context/CartContext';
import StockBadge from '../components/StockBadge';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi.detail(slug).then(({ data }) => setProduct(data)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Container className="py-5 text-center"><Spinner /></Container>;
  if (!product) return <Container className="py-5">Product not found</Container>;

  const inStock = parseFloat(product.stock_qty) > 0;

  return (
    <Container className="py-4">
      <Helmet>
        <title>{product.name} — Fresh Market</title>
        <meta name="description" content={product.description?.slice(0, 160)} />
      </Helmet>
      <Row>
        <Col md={5}>
          {product.images?.[0]?.image || product.primary_image ? (
            <img
              src={product.images?.[0]?.image || product.primary_image}
              alt={product.name}
              className="img-fluid rounded shadow-sm"
              loading="lazy"
            />
          ) : (
            <div className="bg-light rounded p-5 text-center">No image</div>
          )}
        </Col>
        <Col md={7}>
          <h1>{product.name}</h1>
          <p className="text-muted">{product.category_name} · {product.seller_name}</p>
          <StockBadge stockQty={product.stock_qty} unit={product.unit} />
          <h3 className="mt-3">{product.price} ₽ / {product.unit_display || product.unit}</h3>
          <p className="mt-3">{product.description}</p>
          {inStock && (
            <div className="d-flex gap-2 align-items-center mt-3">
              <Form.Control
                type="number" min="0.1" step="0.1" max={product.stock_qty}
                value={qty} onChange={(e) => setQty(parseFloat(e.target.value) || 1)}
                style={{ width: 100 }}
              />
              <Button variant="success" onClick={() => addItem(product, qty)}>Add to cart</Button>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}
