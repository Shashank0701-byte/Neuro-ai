const request = require('supertest');
const app = require('../server');

describe('Technical Pipeline API Tests', () => {
  
  describe('GET /api/technical-pipeline', () => {
    it('should return complete technical pipeline', async () => {
      const res = await request(app)
        .get('/api/technical-pipeline')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('overview');
      expect(res.body.data).toHaveProperty('modules');
      expect(res.body.data).toHaveProperty('dataFlow');
      expect(res.body.data).toHaveProperty('performance');
      expect(res.body).toHaveProperty('metadata');
    });

    it('should have 8 modules', async () => {
      const res = await request(app)
        .get('/api/technical-pipeline')
        .expect(200);

      expect(res.body.data.modules).toHaveLength(8);
    });
  });

  describe('GET /api/technical-pipeline/overview', () => {
    it('should return pipeline overview', async () => {
      const res = await request(app)
        .get('/api/technical-pipeline/overview')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('title');
      expect(res.body.data).toHaveProperty('description');
      expect(res.body.data).toHaveProperty('totalModules');
      expect(res.body.data.totalModules).toBe(8);
    });
  });

  describe('GET /api/technical-pipeline/modules', () => {
    it('should return all modules', async () => {
      const res = await request(app)
        .get('/api/technical-pipeline/modules')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.count).toBe(8);
      expect(res.body).toHaveProperty('metadata');
    });

    it('should have required module properties', async () => {
      const res = await request(app)
        .get('/api/technical-pipeline/modules')
        .expect(200);

      const module = res.body.data[0];
      expect(module).toHaveProperty('id');
      expect(module).toHaveProperty('name');
      expect(module).toHaveProperty('category');
      expect(module).toHaveProperty('order');
      expect(module).toHaveProperty('description');
      expect(module).toHaveProperty('icon');
      expect(module).toHaveProperty('processingTime');
      expect(module).toHaveProperty('technologies');
    });
  });

  describe('GET /api/technical-pipeline/modules/:id', () => {
    it('should return specific module by ID', async () => {
      const res = await request(app)
        .get('/api/technical-pipeline/modules/ml-inference')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('ml-inference');
      expect(res.body.data.name).toBe('Machine Learning Inference');
      expect(res.body.data.category).toBe('Prediction');
    });

    it('should return 404 for non-existent module', async () => {
      const res = await request(app)
        .get('/api/technical-pipeline/modules/non-existent')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Module not found');
    });
  });

  describe('GET /api/technical-pipeline/modules/category/:category', () => {
    it('should return modules by category', async () => {
      const res = await request(app)
        .get('/api/technical-pipeline/modules/category/Processing')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.category).toBe('Processing');
      
      // All returned modules should be in Processing category
      res.body.data.forEach(module => {
        expect(module.category).toBe('Processing');
      });
    });

    it('should return 404 for non-existent category', async () => {
      const res = await request(app)
        .get('/api/technical-pipeline/modules/category/NonExistent')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/technical-pipeline/categories', () => {
    it('should return all categories with counts', async () => {
      const res = await request(app)
        .get('/api/technical-pipeline/categories')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body).toHaveProperty('totalCategories');
      
      // Check structure of category data
      const category = res.body.data[0];
      expect(category).toHaveProperty('category');
      expect(category).toHaveProperty('count');
      expect(category).toHaveProperty('modules');
    });

    it('should have 6 categories', async () => {
      const res = await request(app)
        .get('/api/technical-pipeline/categories')
        .expect(200);

      expect(res.body.totalCategories).toBe(6);
    });
  });

  describe('GET /api/technical-pipeline/data-flow', () => {
    it('should return data flow information', async () => {
      const res = await request(app)
        .get('/api/technical-pipeline/data-flow')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('description');
      expect(res.body.data).toHaveProperty('stages');
      expect(res.body.data).toHaveProperty('totalStages');
      expect(res.body.data.stages).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/technical-pipeline/performance', () => {
    it('should return performance metrics', async () => {
      const res = await request(app)
        .get('/api/technical-pipeline/performance')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('overall');
      expect(res.body.data).toHaveProperty('infrastructure');
      expect(res.body.data).toHaveProperty('monitoring');
      expect(res.body.data).toHaveProperty('optimization');
    });
  });

  describe('Module Data Validation', () => {
    it('should have all required fields for each module', async () => {
      const res = await request(app)
        .get('/api/technical-pipeline/modules')
        .expect(200);

      res.body.data.forEach(module => {
        expect(module.id).toBeTruthy();
        expect(module.name).toBeTruthy();
        expect(module.category).toBeTruthy();
        expect(module.order).toBeGreaterThan(0);
        expect(module.description).toBeTruthy();
        expect(module.icon).toBeTruthy();
        expect(module.color).toMatch(/^from-\w+-\d+\s+to-\w+-\d+$/);
        expect(module.bgColor).toMatch(/^bg-\w+-\d+$/);
        expect(module.borderColor).toMatch(/^border-\w+-\d+$/);
        expect(module.processingTime).toBeTruthy();
        expect(module.technologies).toBeInstanceOf(Array);
        expect(module.inputs).toBeInstanceOf(Array);
        expect(module.outputs).toBeInstanceOf(Array);
      });
    });

    it('should have modules in correct order', async () => {
      const res = await request(app)
        .get('/api/technical-pipeline/modules')
        .expect(200);

      const orders = res.body.data.map(m => m.order);
      const sortedOrders = [...orders].sort((a, b) => a - b);
      expect(orders).toEqual(sortedOrders);
    });

    it('should have valid categories', async () => {
      const validCategories = ['Input', 'Processing', 'Analysis', 'Prediction', 'Output', 'Infrastructure'];
      
      const res = await request(app)
        .get('/api/technical-pipeline/modules')
        .expect(200);

      res.body.data.forEach(module => {
        expect(validCategories).toContain(module.category);
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const res = await request(app)
        .get('/api/technical-pipeline/non-existent-route')
        .expect(404);

      expect(res.body.error).toBeTruthy();
    });
  });

  describe('Response Format', () => {
    it('should have consistent response structure', async () => {
      const endpoints = [
        '/api/technical-pipeline',
        '/api/technical-pipeline/modules',
        '/api/technical-pipeline/overview',
        '/api/technical-pipeline/data-flow',
        '/api/technical-pipeline/performance'
      ];

      for (const endpoint of endpoints) {
        const res = await request(app)
          .get(endpoint)
          .expect(200);

        expect(res.body).toHaveProperty('success');
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('data');
      }
    });
  });

  describe('Metadata', () => {
    it('should include metadata in main response', async () => {
      const res = await request(app)
        .get('/api/technical-pipeline')
        .expect(200);

      expect(res.body.metadata).toHaveProperty('version');
      expect(res.body.metadata).toHaveProperty('lastUpdated');
      expect(res.body.metadata).toHaveProperty('updatedBy');
    });
  });

  describe('Specific Module Tests', () => {
    const moduleIds = [
      'data-collection',
      'audio-preprocessing',
      'speech-to-text',
      'nlp-analysis',
      'feature-extraction',
      'ml-inference',
      'result-generation',
      'data-storage'
    ];

    moduleIds.forEach(moduleId => {
      it(`should return ${moduleId} module`, async () => {
        const res = await request(app)
          .get(`/api/technical-pipeline/modules/${moduleId}`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(moduleId);
      });
    });
  });

  describe('Category Tests', () => {
    const categories = ['Input', 'Processing', 'Analysis', 'Prediction', 'Output', 'Infrastructure'];

    categories.forEach(category => {
      it(`should return modules for ${category} category`, async () => {
        const res = await request(app)
          .get(`/api/technical-pipeline/modules/category/${category}`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.category).toBe(category);
        expect(res.body.data.length).toBeGreaterThan(0);
      });
    });
  });
});
