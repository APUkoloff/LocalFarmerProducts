import { Container, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <Container className="py-5">
      <Alert variant="warning">
        <h4>Access denied</h4>
        <p>You do not have permission to view this page.</p>
        <Link to="/">Go home</Link>
      </Alert>
    </Container>
  );
}
