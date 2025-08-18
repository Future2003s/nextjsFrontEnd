/**
 * Enterprise Testing Utilities
 * Comprehensive testing setup with mocks, fixtures, and utilities
 */

import { jest } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/auth/auth-service';
import { Product } from '@/services/product-service';

// Mock data generators
export class MockDataGenerator {
  /**
   * Generate mock user
   */
  static createUser(overrides: Partial<User> = {}): User {
    return {
      _id: 'user_' + Math.random().toString(36).substr(2, 9),
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'customer',
      isActive: true,
      isEmailVerified: true,
      lastLogin: new Date().toISOString(),
      addresses: [],
      preferences: {
        language: 'en',
        currency: 'USD',
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
      },
      ...overrides,
    };
  }

  /**
   * Generate mock product
   */
  static createProduct(overrides: Partial<Product> = {}): Product {
    return {
      _id: 'product_' + Math.random().toString(36).substr(2, 9),
      name: 'Test Product',
      description: 'This is a test product description',
      price: 99.99,
      sku: 'TEST-SKU-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      category: 'electronics',
      brand: 'TestBrand',
      tags: ['test', 'electronics'],
      images: ['https://example.com/image1.jpg'],
      inventory: {
        quantity: 100,
        lowStockThreshold: 10,
        trackQuantity: true,
      },
      seo: {
        title: 'Test Product - Best Electronics',
        description: 'Buy the best test product online',
        keywords: ['test', 'product', 'electronics'],
      },
      status: 'active',
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides,
    };
  }

  /**
   * Generate mock API response
   */
  static createApiResponse<T>(data: T, success: boolean = true) {
    return {
      success,
      data: success ? data : undefined,
      error: success ? undefined : 'Mock error',
      message: success ? 'Success' : 'Error occurred',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_test_' + Math.random().toString(36).substr(2, 9),
      },
    };
  }

  /**
   * Generate mock NextRequest
   */
  static createRequest(options: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: any;
  } = {}): NextRequest {
    const {
      method = 'GET',
      url = 'http://localhost:3000/api/test',
      headers = {},
      body,
    } = options;

    const request = new NextRequest(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return request;
  }
}

// Mock implementations
export class MockServices {
  /**
   * Mock HTTP client
   */
  static createHttpClient() {
    return {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
    };
  }

  /**
   * Mock cache service
   */
  static createCacheService() {
    const cache = new Map();
    
    return {
      get: jest.fn().mockImplementation((key: string) => {
        return Promise.resolve(cache.get(key) || null);
      }),
      set: jest.fn().mockImplementation((key: string, value: any) => {
        cache.set(key, value);
        return Promise.resolve();
      }),
      delete: jest.fn().mockImplementation((key: string) => {
        cache.delete(key);
        return Promise.resolve();
      }),
      clear: jest.fn().mockImplementation(() => {
        cache.clear();
        return Promise.resolve();
      }),
      exists: jest.fn().mockImplementation((key: string) => {
        return Promise.resolve(cache.has(key));
      }),
    };
  }

  /**
   * Mock auth service
   */
  static createAuthService() {
    return {
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      getCurrentUser: jest.fn(),
      refreshToken: jest.fn(),
      changePassword: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      isAuthenticated: jest.fn().mockReturnValue(true),
      hasRole: jest.fn().mockReturnValue(true),
      isAdmin: jest.fn().mockReturnValue(false),
    };
  }

  /**
   * Mock product service
   */
  static createProductService() {
    return {
      get: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getProducts: jest.fn(),
      getFeaturedProducts: jest.fn(),
      getProductsByCategory: jest.fn(),
      searchProducts: jest.fn(),
      getRecommendations: jest.fn(),
      checkAvailability: jest.fn(),
      getLowStockProducts: jest.fn(),
    };
  }
}

// Test utilities
export class TestUtils {
  /**
   * Wait for async operations
   */
  static async waitFor(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create test environment
   */
  static setupTestEnvironment() {
    // Mock environment variables
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_END_POINT = 'http://localhost:8081/api/v1';
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

    // Mock console methods in test environment
    if (process.env.NODE_ENV === 'test') {
      global.console = {
        ...console,
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };
    }
  }

  /**
   * Clean up test environment
   */
  static cleanupTestEnvironment() {
    jest.clearAllMocks();
    jest.resetAllMocks();
  }

  /**
   * Assert API response format
   */
  static assertApiResponse(response: any, expectedSuccess: boolean = true) {
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(expectedSuccess);
    
    if (expectedSuccess) {
      expect(response).toHaveProperty('data');
    } else {
      expect(response).toHaveProperty('error');
    }
    
    expect(response).toHaveProperty('meta');
    expect(response.meta).toHaveProperty('timestamp');
  }

  /**
   * Assert error response format
   */
  static assertErrorResponse(response: any, expectedCode?: string) {
    expect(response).toHaveProperty('success', false);
    expect(response).toHaveProperty('error');
    expect(response).toHaveProperty('userMessage');
    
    if (expectedCode) {
      expect(response).toHaveProperty('code', expectedCode);
    }
  }

  /**
   * Mock fetch globally
   */
  static mockFetch(responses: Array<{ url?: string; response: any; status?: number }>) {
    const mockFetch = jest.fn();
    
    responses.forEach(({ url, response, status = 200 }) => {
      const mockResponse = {
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response)),
        headers: new Map([['content-type', 'application/json']]),
      };

      if (url) {
        mockFetch.mockImplementationOnce((requestUrl: string) => {
          if (requestUrl.includes(url)) {
            return Promise.resolve(mockResponse);
          }
          return Promise.reject(new Error('Unexpected URL'));
        });
      } else {
        mockFetch.mockResolvedValueOnce(mockResponse);
      }
    });

    global.fetch = mockFetch as any;
    return mockFetch;
  }

  /**
   * Create test database
   */
  static createTestDatabase() {
    const db = new Map();
    
    return {
      users: new Map(),
      products: new Map(),
      orders: new Map(),
      
      // Helper methods
      seed: (collection: string, data: any[]) => {
        const collectionMap = db.get(collection) || new Map();
        data.forEach(item => collectionMap.set(item._id, item));
        db.set(collection, collectionMap);
      },
      
      find: (collection: string, id: string) => {
        const collectionMap = db.get(collection);
        return collectionMap ? collectionMap.get(id) : null;
      },
      
      findAll: (collection: string) => {
        const collectionMap = db.get(collection);
        return collectionMap ? Array.from(collectionMap.values()) : [];
      },
      
      clear: () => db.clear(),
    };
  }
}

// Test fixtures
export const testFixtures = {
  users: {
    customer: MockDataGenerator.createUser({ role: 'customer' }),
    admin: MockDataGenerator.createUser({ role: 'admin', email: 'admin@example.com' }),
    inactive: MockDataGenerator.createUser({ isActive: false }),
  },
  
  products: {
    active: MockDataGenerator.createProduct({ status: 'active' }),
    inactive: MockDataGenerator.createProduct({ status: 'inactive' }),
    featured: MockDataGenerator.createProduct({ featured: true }),
    outOfStock: MockDataGenerator.createProduct({ 
      inventory: { quantity: 0, lowStockThreshold: 10, trackQuantity: true } 
    }),
  },
  
  apiResponses: {
    success: MockDataGenerator.createApiResponse({ message: 'Success' }),
    error: MockDataGenerator.createApiResponse(null, false),
    notFound: MockDataGenerator.createApiResponse(null, false),
  },
};

// Export everything
export { MockDataGenerator, MockServices, TestUtils, testFixtures };
