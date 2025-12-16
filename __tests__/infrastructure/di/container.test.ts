/**
 * DIコンテナのテスト
 */

import { Container } from '@/infrastructure/di/container';

describe('Container', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  afterEach(() => {
    container.clear();
  });

  describe('bind and resolve (transient)', () => {
    it('should register and resolve a simple dependency', () => {
      // Arrange
      const key = Symbol('test');
      const value = { name: 'Test Object' };
      container.bind(key, () => value);

      // Act
      const resolved = container.resolve<typeof value>(key);

      // Assert
      expect(resolved).toBe(value);
    });

    it('should create new instance for each resolve (transient)', () => {
      // Arrange
      const key = Symbol('test');
      container.bind(key, () => ({ id: Math.random() }));

      // Act
      const instance1 = container.resolve<{ id: number }>(key);
      const instance2 = container.resolve<{ id: number }>(key);

      // Assert
      expect(instance1.id).not.toBe(instance2.id);
    });

    it('should throw error when resolving unregistered key', () => {
      // Arrange
      const key = Symbol('unregistered');

      // Act & Assert
      expect(() => container.resolve(key)).toThrow('No binding found for key');
    });
  });

  describe('bindSingleton and resolve (singleton)', () => {
    it('should return same instance for singleton', () => {
      // Arrange
      const key = Symbol('singleton');
      container.bindSingleton(key, () => ({ id: Math.random() }));

      // Act
      const instance1 = container.resolve<{ id: number }>(key);
      const instance2 = container.resolve<{ id: number }>(key);

      // Assert
      expect(instance1).toBe(instance2);
      expect(instance1.id).toBe(instance2.id);
    });
  });

  describe('bindAsync and resolveAsync', () => {
    it('should register and resolve async dependency', async () => {
      // Arrange
      const key = Symbol('async');
      const value = { name: 'Async Object' };
      container.bindAsync(key, async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return value;
      });

      // Act
      const resolved = await container.resolveAsync<typeof value>(key);

      // Assert
      expect(resolved).toBe(value);
    });

    it('should throw error when resolving async binding synchronously', () => {
      // Arrange
      const key = Symbol('async');
      container.bindAsync(key, async () => ({ name: 'Test' }));

      // Act & Assert
      expect(() => container.resolve(key)).toThrow(
        'Cannot resolve async binding synchronously'
      );
    });

    it('should resolve sync binding with resolveAsync', async () => {
      // Arrange
      const key = Symbol('sync');
      const value = { name: 'Sync Object' };
      container.bind(key, () => value);

      // Act
      const resolved = await container.resolveAsync<typeof value>(key);

      // Assert
      expect(resolved).toBe(value);
    });
  });

  describe('clear and unbind', () => {
    it('should clear all bindings', () => {
      // Arrange
      const key1 = Symbol('key1');
      const key2 = Symbol('key2');
      container.bind(key1, () => 'value1');
      container.bind(key2, () => 'value2');

      // Act
      container.clear();

      // Assert
      expect(() => container.resolve(key1)).toThrow();
      expect(() => container.resolve(key2)).toThrow();
    });

    it('should unbind specific key', () => {
      // Arrange
      const key1 = Symbol('key1');
      const key2 = Symbol('key2');
      container.bind(key1, () => 'value1');
      container.bind(key2, () => 'value2');

      // Act
      container.unbind(key1);

      // Assert
      expect(() => container.resolve(key1)).toThrow();
      expect(container.resolve<string>(key2)).toBe('value2');
    });
  });

  describe('type safety', () => {
    it('should maintain type safety with TypeScript', () => {
      // Arrange
      interface IService {
        getName(): string;
      }
      const key = Symbol.for('IService');
      const service: IService = {
        getName: () => 'Test Service',
      };
      container.bind<IService>(key, () => service);

      // Act
      const resolved = container.resolve<IService>(key);

      // Assert
      expect(resolved.getName()).toBe('Test Service');
    });
  });
});
