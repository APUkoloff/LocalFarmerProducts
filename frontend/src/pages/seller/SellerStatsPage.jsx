import { useEffect, useState } from 'react';
import { Card, Col, Row, Form } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../../services/api';

export default function SellerStatsPage() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    analyticsApi.seller({ period }).then(({ data: d }) => setData(d));
  }, [period]);

  if (!data) return <p>Loading...</p>;

  return (
    <>
      <Form.Select style={{ width: 200 }} value={period} onChange={(e) => setPeriod(e.target.value)} className="mb-3">
        <option value="day">Day</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </Form.Select>
      <Row className="g-3 mb-4">
        <Col md={6}>
          <Card className="shadow-sm"><Card.Body>
            <Card.Title>Revenue</Card.Title>
            <h3>{data.total_revenue?.toFixed(2)} ₽</h3>
          </Card.Body></Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm"><Card.Body>
            <Card.Title>Orders</Card.Title>
            <h3>{data.orders_count}</h3>
          </Card.Body></Card>
        </Col>
      </Row>
      <Card className="shadow-sm p-3">
        <h5>Revenue over time</h5>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.revenue_by_period || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#2d6a4f" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </>
  );
}
