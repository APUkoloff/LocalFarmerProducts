import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Offcanvas, Button, Spinner } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { productsApi } from '../services/api';
import { useCart } from '../context/CartContext';

export default function CatalogPage() {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const ordering = searchParams.get('ordering') || '-created_at';
  const inStock = searchParams.get('in_stock') === 'true';

  useEffect(() => {
    productsApi.categories().then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, ordering };
    if (category) params.category = category;
    if (search) params.search = search;
    if (inStock) params.in_stock = 'true';
    productsApi.list(params).then(({ data }) => {
      setProducts(data.results || data);
      setTotalPages(Math.ceil((data.count || data.length) / 20) || 1);
    }).finally(() => setLoading(false));
  }, [page, category, search, ordering, inStock]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const filterPanel = (
    <>
      <Form.Group className="mb-3">
        <Form.Label>{t('catalog.search')}</Form.Label>
        <Form.Control
          defaultValue={search}
          onBlur={(e) => updateParam('search', e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Category</Form.Label>
        <Form.Select value={category} onChange={(e) => updateParam('category', e.target.value)}>
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.localized_name || c.name_ru}</option>
          ))}
        </Form.Select>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>{t('catalog.sort')}</Form.Label>
        <Form.Select value={ordering} onChange={(e) => updateParam('ordering', e.target.value)}>
          <option value="-created_at">Newest</option>
          <option value="price">Price ↑</option>
          <option value="-price">Price ↓</option>
          <option value="name">Name A-Z</option>
          <option value="-rating_avg">Rating</option>
        </Form.Select>
      </Form.Group>
      <Form.Check
        type="checkbox"
        label={t('catalog.inStock')}
        checked={inStock}
        onChange={(e) => updateParam('in_stock', e.target.checked ? 'true' : '')}
      />
    </>
  );

  return (
    <>
      <Helmet><title>{t('catalog.title')} — Fresh Market</title></Helmet>
      <Container>
        <div className="d-flex justify-content-between align-items-center page-header">
          <h2>{t('catalog.title')}</h2>
          <Button variant="outline-secondary" className="d-lg-none" onClick={() => setShowFilters(true)}>
            Filters
          </Button>
        </div>
        <Row>
          <Col lg={3} className="d-none d-lg-block">{filterPanel}</Col>
          <Col lg={9}>
            {loading ? (
              <div className="text-center py-5"><Spinner /></div>
            ) : (
              <>
                <Row xs={1} sm={2} md={3} className="g-3">
                  {products.map((p) => (
                    <Col key={p.id}>
                      <ProductCard product={p} onAddToCart={(prod) => {
                        if (parseFloat(prod.stock_qty) < 1) return;
                        addItem(prod);
                      }} />
                    </Col>
                  ))}
                </Row>
                <Pagination page={page} totalPages={totalPages} onPageChange={(p) => updateParam('page', String(p))} />
              </>
            )}
          </Col>
        </Row>
        <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="start">
          <Offcanvas.Header closeButton><Offcanvas.Title>Filters</Offcanvas.Title></Offcanvas.Header>
          <Offcanvas.Body>{filterPanel}</Offcanvas.Body>
        </Offcanvas>
      </Container>
    </>
  );
}
