/**
 * Unit tests for Ride Service
 *
 * Tests ride state transitions and validation logic.
 */

import { RideStatus, RideStateTransitions, canTransition } from '../../../../shared/interfaces/common.interfaces';

describe('Ride Service', () => {
  describe('State Machine', () => {
    describe('Valid transitions from PENDING', () => {
      it('should allow transition to SEARCHING', () => {
        expect(canTransition(RideStateTransitions, RideStatus.PENDING, RideStatus.SEARCHING)).toBe(true);
      });

      it('should allow transition to CANCELLED', () => {
        expect(canTransition(RideStateTransitions, RideStatus.PENDING, RideStatus.CANCELLED)).toBe(true);
      });

      it('should not allow transition to COMPLETED', () => {
        expect(canTransition(RideStateTransitions, RideStatus.PENDING, RideStatus.COMPLETED)).toBe(false);
      });

      it('should not allow transition to IN_PROGRESS', () => {
        expect(canTransition(RideStateTransitions, RideStatus.PENDING, RideStatus.IN_PROGRESS)).toBe(false);
      });
    });

    describe('Valid transitions from SEARCHING', () => {
      it('should allow transition to DRIVER_ASSIGNED', () => {
        expect(canTransition(RideStateTransitions, RideStatus.SEARCHING, RideStatus.DRIVER_ASSIGNED)).toBe(true);
      });

      it('should allow transition to NO_DRIVERS', () => {
        expect(canTransition(RideStateTransitions, RideStatus.SEARCHING, RideStatus.NO_DRIVERS)).toBe(true);
      });

      it('should allow transition to CANCELLED', () => {
        expect(canTransition(RideStateTransitions, RideStatus.SEARCHING, RideStatus.CANCELLED)).toBe(true);
      });

      it('should not allow transition to COMPLETED', () => {
        expect(canTransition(RideStateTransitions, RideStatus.SEARCHING, RideStatus.COMPLETED)).toBe(false);
      });
    });

    describe('Valid transitions from DRIVER_ASSIGNED', () => {
      it('should allow transition to DRIVER_ARRIVED', () => {
        expect(canTransition(RideStateTransitions, RideStatus.DRIVER_ASSIGNED, RideStatus.DRIVER_ARRIVED)).toBe(true);
      });

      it('should allow transition to CANCELLED', () => {
        expect(canTransition(RideStateTransitions, RideStatus.DRIVER_ASSIGNED, RideStatus.CANCELLED)).toBe(true);
      });

      it('should not allow transition to IN_PROGRESS directly', () => {
        expect(canTransition(RideStateTransitions, RideStatus.DRIVER_ASSIGNED, RideStatus.IN_PROGRESS)).toBe(false);
      });
    });

    describe('Valid transitions from DRIVER_ARRIVED', () => {
      it('should allow transition to IN_PROGRESS', () => {
        expect(canTransition(RideStateTransitions, RideStatus.DRIVER_ARRIVED, RideStatus.IN_PROGRESS)).toBe(true);
      });

      it('should allow transition to CANCELLED', () => {
        expect(canTransition(RideStateTransitions, RideStatus.DRIVER_ARRIVED, RideStatus.CANCELLED)).toBe(true);
      });

      it('should not allow transition to COMPLETED directly', () => {
        expect(canTransition(RideStateTransitions, RideStatus.DRIVER_ARRIVED, RideStatus.COMPLETED)).toBe(false);
      });
    });

    describe('Valid transitions from IN_PROGRESS', () => {
      it('should allow transition to COMPLETED', () => {
        expect(canTransition(RideStateTransitions, RideStatus.IN_PROGRESS, RideStatus.COMPLETED)).toBe(true);
      });

      it('should not allow transition to CANCELLED', () => {
        expect(canTransition(RideStateTransitions, RideStatus.IN_PROGRESS, RideStatus.CANCELLED)).toBe(false);
      });

      it('should not allow transition to SEARCHING', () => {
        expect(canTransition(RideStateTransitions, RideStatus.IN_PROGRESS, RideStatus.SEARCHING)).toBe(false);
      });
    });

    describe('Terminal states', () => {
      it('should not allow any transition from COMPLETED', () => {
        Object.values(RideStatus).forEach((status) => {
          expect(canTransition(RideStateTransitions, RideStatus.COMPLETED, status)).toBe(false);
        });
      });

      it('should not allow any transition from CANCELLED', () => {
        Object.values(RideStatus).forEach((status) => {
          expect(canTransition(RideStateTransitions, RideStatus.CANCELLED, status)).toBe(false);
        });
      });

      it('should not allow any transition from NO_DRIVERS', () => {
        Object.values(RideStatus).forEach((status) => {
          expect(canTransition(RideStateTransitions, RideStatus.NO_DRIVERS, status)).toBe(false);
        });
      });
    });
  });

  describe('Fare Estimation', () => {
    /**
     * Calculate distance using Haversine formula
     */
    function calculateDistanceKm(
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number,
    ): number {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    it('should calculate correct distance between two points', () => {
      // Bangalore MG Road to Koramangala (~5km)
      const distance = calculateDistanceKm(12.9716, 77.5946, 12.9352, 77.6245);
      expect(distance).toBeGreaterThan(4);
      expect(distance).toBeLessThan(6);
    });

    it('should return 0 for same location', () => {
      const distance = calculateDistanceKm(12.9716, 77.5946, 12.9716, 77.5946);
      expect(distance).toBe(0);
    });

    it('should handle cross-hemisphere calculations', () => {
      // New York to London (~5570km)
      const distance = calculateDistanceKm(40.7128, -74.0060, 51.5074, -0.1278);
      expect(distance).toBeGreaterThan(5500);
      expect(distance).toBeLessThan(5700);
    });
  });

  describe('Validation', () => {
    /**
     * Validate location coordinates
     */
    function isValidLocation(lat: number, lng: number): boolean {
      return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }

    it('should validate valid coordinates', () => {
      expect(isValidLocation(12.9716, 77.5946)).toBe(true);
      expect(isValidLocation(0, 0)).toBe(true);
      expect(isValidLocation(-90, -180)).toBe(true);
      expect(isValidLocation(90, 180)).toBe(true);
    });

    it('should reject invalid latitude', () => {
      expect(isValidLocation(91, 77.5946)).toBe(false);
      expect(isValidLocation(-91, 77.5946)).toBe(false);
    });

    it('should reject invalid longitude', () => {
      expect(isValidLocation(12.9716, 181)).toBe(false);
      expect(isValidLocation(12.9716, -181)).toBe(false);
    });

    /**
     * Validate ride tier
     */
    function isValidTier(tier: string): boolean {
      return ['ECONOMY', 'COMFORT', 'PREMIUM', 'XL'].includes(tier);
    }

    it('should validate valid tiers', () => {
      expect(isValidTier('ECONOMY')).toBe(true);
      expect(isValidTier('COMFORT')).toBe(true);
      expect(isValidTier('PREMIUM')).toBe(true);
      expect(isValidTier('XL')).toBe(true);
    });

    it('should reject invalid tiers', () => {
      expect(isValidTier('LUXURY')).toBe(false);
      expect(isValidTier('BASIC')).toBe(false);
      expect(isValidTier('')).toBe(false);
    });

    /**
     * Validate payment method
     */
    function isValidPaymentMethod(method: string): boolean {
      return ['CASH', 'CARD', 'WALLET'].includes(method);
    }

    it('should validate valid payment methods', () => {
      expect(isValidPaymentMethod('CASH')).toBe(true);
      expect(isValidPaymentMethod('CARD')).toBe(true);
      expect(isValidPaymentMethod('WALLET')).toBe(true);
    });

    it('should reject invalid payment methods', () => {
      expect(isValidPaymentMethod('CRYPTO')).toBe(false);
      expect(isValidPaymentMethod('CHEQUE')).toBe(false);
    });
  });

  describe('Idempotency', () => {
    /**
     * Generate hash for request (simplified)
     */
    function hashRequest(path: string, method: string, body: any): string {
      const data = JSON.stringify({ path, method, body });
      // Simplified hash for testing
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash.toString(16);
    }

    it('should generate same hash for identical requests', () => {
      const body = { pickupLat: 12.97, pickupLng: 77.59 };
      const hash1 = hashRequest('/v1/rides', 'POST', body);
      const hash2 = hashRequest('/v1/rides', 'POST', body);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different bodies', () => {
      const body1 = { pickupLat: 12.97, pickupLng: 77.59 };
      const body2 = { pickupLat: 12.98, pickupLng: 77.60 };
      const hash1 = hashRequest('/v1/rides', 'POST', body1);
      const hash2 = hashRequest('/v1/rides', 'POST', body2);

      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hash for different paths', () => {
      const body = { pickupLat: 12.97, pickupLng: 77.59 };
      const hash1 = hashRequest('/v1/rides', 'POST', body);
      const hash2 = hashRequest('/v1/trips', 'POST', body);

      expect(hash1).not.toBe(hash2);
    });
  });
});
