import request from 'supertest';
import app from '../../src/app';

describe('Products API', () => {
  beforeAll(async () => {
    // Setup test database if needed
  });

  afterAll(async () => {
    // Cleanup test database if needed
  });

  describe('GET /api/products', () => {
    it('should return list of products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });

    it('should return products with correct structure', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      if (response.body.length > 0) {
        const product = response.body[0];
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
      }
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});

