/**
 * Unit tests for Fare Calculation
 *
 * Tests the fare calculation logic used in trip completion.
 */

describe('Fare Calculation', () => {
  // Fare configuration (same as in configuration.ts)
  const fareConfig = {
    baseFare: {
      ECONOMY: 50,
      COMFORT: 80,
      PREMIUM: 120,
      XL: 100,
    },
    ratePerKm: 12,
    ratePerMin: 2,
    taxRate: 0.18,
  };

  /**
   * Calculate fare based on tier, distance, and duration
   */
  function calculateFare(
    tier: string,
    distanceKm: number,
    durationMinutes: number,
    surgeMultiplier: number = 1.0,
  ) {
    const baseFare = fareConfig.baseFare[tier] || 50;
    const distanceFare = Math.round(distanceKm * fareConfig.ratePerKm * 100) / 100;
    const timeFare = Math.round(durationMinutes * fareConfig.ratePerMin * 100) / 100;

    const subtotal = baseFare + distanceFare + timeFare;
    const surgeAmount = Math.round((subtotal * (surgeMultiplier - 1)) * 100) / 100;
    const subtotalWithSurge = subtotal + surgeAmount;
    const taxes = Math.round(subtotalWithSurge * fareConfig.taxRate * 100) / 100;
    const total = Math.round((subtotalWithSurge + taxes) * 100) / 100;

    return {
      baseFare,
      distanceFare,
      timeFare,
      surgeAmount,
      taxes,
      total,
      currency: 'INR',
    };
  }

  describe('Base fare by tier', () => {
    it('should return correct base fare for ECONOMY', () => {
      const fare = calculateFare('ECONOMY', 0, 0);
      expect(fare.baseFare).toBe(50);
    });

    it('should return correct base fare for COMFORT', () => {
      const fare = calculateFare('COMFORT', 0, 0);
      expect(fare.baseFare).toBe(80);
    });

    it('should return correct base fare for PREMIUM', () => {
      const fare = calculateFare('PREMIUM', 0, 0);
      expect(fare.baseFare).toBe(120);
    });

    it('should return correct base fare for XL', () => {
      const fare = calculateFare('XL', 0, 0);
      expect(fare.baseFare).toBe(100);
    });

    it('should default to 50 for unknown tier', () => {
      const fare = calculateFare('UNKNOWN', 0, 0);
      expect(fare.baseFare).toBe(50);
    });
  });

  describe('Distance fare calculation', () => {
    it('should calculate distance fare correctly for 5km', () => {
      const fare = calculateFare('ECONOMY', 5, 0);
      expect(fare.distanceFare).toBe(60); // 5 * 12 = 60
    });

    it('should calculate distance fare correctly for 10km', () => {
      const fare = calculateFare('ECONOMY', 10, 0);
      expect(fare.distanceFare).toBe(120); // 10 * 12 = 120
    });

    it('should handle decimal distances', () => {
      const fare = calculateFare('ECONOMY', 7.5, 0);
      expect(fare.distanceFare).toBe(90); // 7.5 * 12 = 90
    });
  });

  describe('Time fare calculation', () => {
    it('should calculate time fare correctly for 15 minutes', () => {
      const fare = calculateFare('ECONOMY', 0, 15);
      expect(fare.timeFare).toBe(30); // 15 * 2 = 30
    });

    it('should calculate time fare correctly for 30 minutes', () => {
      const fare = calculateFare('ECONOMY', 0, 30);
      expect(fare.timeFare).toBe(60); // 30 * 2 = 60
    });
  });

  describe('Surge pricing', () => {
    it('should not add surge for multiplier of 1.0', () => {
      const fare = calculateFare('ECONOMY', 5, 15, 1.0);
      expect(fare.surgeAmount).toBe(0);
    });

    it('should calculate surge correctly for 1.5x multiplier', () => {
      const fare = calculateFare('ECONOMY', 5, 15, 1.5);
      // Subtotal: 50 + 60 + 30 = 140
      // Surge: 140 * 0.5 = 70
      expect(fare.surgeAmount).toBe(70);
    });

    it('should calculate surge correctly for 2.0x multiplier', () => {
      const fare = calculateFare('ECONOMY', 5, 15, 2.0);
      // Subtotal: 50 + 60 + 30 = 140
      // Surge: 140 * 1.0 = 140
      expect(fare.surgeAmount).toBe(140);
    });
  });

  describe('Tax calculation', () => {
    it('should calculate 18% tax correctly', () => {
      const fare = calculateFare('ECONOMY', 5, 15);
      // Subtotal: 50 + 60 + 30 = 140
      // Tax: 140 * 0.18 = 25.2
      expect(fare.taxes).toBe(25.2);
    });

    it('should apply tax after surge', () => {
      const fare = calculateFare('ECONOMY', 5, 15, 1.5);
      // Subtotal: 140, Surge: 70, SubtotalWithSurge: 210
      // Tax: 210 * 0.18 = 37.8
      expect(fare.taxes).toBe(37.8);
    });
  });

  describe('Total fare calculation', () => {
    it('should calculate total correctly for basic ride', () => {
      const fare = calculateFare('ECONOMY', 5, 15);
      // Base: 50, Distance: 60, Time: 30
      // Subtotal: 140
      // Tax: 25.2
      // Total: 165.2
      expect(fare.total).toBe(165.2);
    });

    it('should calculate total correctly with surge', () => {
      const fare = calculateFare('ECONOMY', 5, 15, 1.5);
      // Subtotal: 140, Surge: 70, SubtotalWithSurge: 210
      // Tax: 37.8
      // Total: 247.8
      expect(fare.total).toBe(247.8);
    });

    it('should calculate total correctly for PREMIUM tier', () => {
      const fare = calculateFare('PREMIUM', 10, 30);
      // Base: 120, Distance: 120, Time: 60
      // Subtotal: 300
      // Tax: 54
      // Total: 354
      expect(fare.total).toBe(354);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero distance and time', () => {
      const fare = calculateFare('ECONOMY', 0, 0);
      // Base: 50, Distance: 0, Time: 0
      // Subtotal: 50
      // Tax: 9
      // Total: 59
      expect(fare.total).toBe(59);
    });

    it('should handle very long ride', () => {
      const fare = calculateFare('ECONOMY', 50, 120);
      // Base: 50, Distance: 600, Time: 240
      // Subtotal: 890
      // Tax: 160.2
      // Total: 1050.2
      expect(fare.total).toBe(1050.2);
    });

    it('should return consistent currency', () => {
      const fare = calculateFare('ECONOMY', 5, 15);
      expect(fare.currency).toBe('INR');
    });
  });
});
