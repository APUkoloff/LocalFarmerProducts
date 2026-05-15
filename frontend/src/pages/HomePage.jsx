import { Container, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>Fresh Market — {t('home.title')}</title>
        <meta name="description" content={t('home.subtitle')} />
      </Helmet>
      <Container>
        <Row className="align-items-center py-5">
          <Col md={7}>
            <h1 className="display-5 fw-bold" style={{ color: '#2d6a4f' }}>{t('home.title')}</h1>
            <p className="lead text-muted">{t('home.subtitle')}</p>
            <Button as={Link} to="/catalog" variant="success" size="lg">
              {t('nav.catalog')}
            </Button>
          </Col>
          <Col md={5} className="text-center d-none d-md-block">
            <div className="rounded-circle bg-success bg-opacity-10 p-5">
              <span style={{ fontSize: '5rem' }}>🌿</span>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}
