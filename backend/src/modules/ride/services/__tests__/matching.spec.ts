/**
 * Unit tests for Driver Matching Algorithm
 *
 * Tests the driver ranking and selection logic.
 */

describe('Driver Matching Algorithm', () => {
  /**
   * Calculate driver score (same logic as in ride.service.ts)
   */
  function calculateScore(driver: {
    distance: number;
    rating: number;
    acceptanceRate: number;
  }): number {
    // Distance: closer is better (max 100 points, decreases by 1 point per 50m)
    const distanceScore = Math.max(0, 100 - driver.distance / 50);
    // Rating: 5.0 = 50 points
    const ratingScore = driver.rating * 10;
    // Acceptance rate: 1.0 = 30 points
    const acceptanceScore = driver.acceptanceRate * 30;

    return distanceScore * 0.5 + ratingScore * 0.3 + acceptanceScore * 0.2;
  }

  /**
   * Rank drivers by score
   */
  function rankDrivers(
    drivers: Array<{
      driverId: string;
      distance: number;
      rating: number;
      acceptanceRate: number;
    }>,
  ) {
    return drivers
      .map((d) => ({
        ...d,
        score: calculateScore(d),
      }))
      .sort((a, b) => b.score - a.score);
  }

  describe('Score calculation', () => {
    it('should give higher score to closer drivers', () => {
      const closeDriver = { distance: 100, rating: 4.5, acceptanceRate: 0.9 };
      const farDriver = { distance: 2000, rating: 4.5, acceptanceRate: 0.9 };

      expect(calculateScore(closeDriver)).toBeGreaterThan(
        calculateScore(farDriver),
      );
    });

    it('should give higher score to higher-rated drivers', () => {
      const highRated = { distance: 500, rating: 5.0, acceptanceRate: 0.9 };
      const lowRated = { distance: 500, rating: 3.5, acceptanceRate: 0.9 };

      expect(calculateScore(highRated)).toBeGreaterThan(
        calculateScore(lowRated),
      );
    });

    it('should give higher score to drivers with higher acceptance rate', () => {
      const highAcceptance = {
        distance: 500,
        rating: 4.5,
        acceptanceRate: 1.0,
      };
      const lowAcceptance = { distance: 500, rating: 4.5, acceptanceRate: 0.5 };

      expect(calculateScore(highAcceptance)).toBeGreaterThan(
        calculateScore(lowAcceptance),
      );
    });

    it('should cap distance score at 0 for very far drivers', () => {
      const veryFarDriver = {
        distance: 10000,
        rating: 5.0,
        acceptanceRate: 1.0,
      };
      const score = calculateScore(veryFarDriver);

      // Distance score should be 0, but rating and acceptance still count
      // Score = 0 * 0.5 + 50 * 0.3 + 30 * 0.2 = 0 + 15 + 6 = 21
      expect(score).toBe(21);
    });

    it('should give maximum score to perfect nearby driver', () => {
      const perfectDriver = { distance: 0, rating: 5.0, acceptanceRate: 1.0 };
      const score = calculateScore(perfectDriver);

      // Distance: 100, Rating: 50, Acceptance: 30
      // Score = 100 * 0.5 + 50 * 0.3 + 30 * 0.2 = 50 + 15 + 6 = 71
      expect(score).toBe(71);
    });
  });

  describe('Driver ranking', () => {
    it('should rank drivers by score descending', () => {
      const drivers = [
        { driverId: '1', distance: 2000, rating: 4.0, acceptanceRate: 0.7 },
        { driverId: '2', distance: 500, rating: 4.5, acceptanceRate: 0.9 },
        { driverId: '3', distance: 100, rating: 5.0, acceptanceRate: 1.0 },
      ];

      const ranked = rankDrivers(drivers);

      expect(ranked[0].driverId).toBe('3'); // Closest, highest rated
      expect(ranked[1].driverId).toBe('2');
      expect(ranked[2].driverId).toBe('1');
    });

    it('should break ties by considering all factors', () => {
      const drivers = [
        { driverId: '1', distance: 500, rating: 4.5, acceptanceRate: 0.8 },
        { driverId: '2', distance: 500, rating: 4.5, acceptanceRate: 0.9 },
      ];

      const ranked = rankDrivers(drivers);

      expect(ranked[0].driverId).toBe('2'); // Higher acceptance rate
    });

    it('should handle empty driver list', () => {
      const ranked = rankDrivers([]);
      expect(ranked).toHaveLength(0);
    });

    it('should handle single driver', () => {
      const drivers = [
        { driverId: '1', distance: 500, rating: 4.5, acceptanceRate: 0.9 },
      ];

      const ranked = rankDrivers(drivers);

      expect(ranked).toHaveLength(1);
      expect(ranked[0].driverId).toBe('1');
    });
  });

  describe('Weight distribution', () => {
    it('should weight distance at 50%', () => {
      // Create two drivers where only distance differs significantly
      const close = { distance: 100, rating: 4.0, acceptanceRate: 0.8 };
      const far = { distance: 5000, rating: 4.0, acceptanceRate: 0.8 };

      const closeScore = calculateScore(close);
      const farScore = calculateScore(far);

      // Distance difference should account for ~50% of score difference
      // Close: distanceScore = 98, Far: distanceScore = 0
      // Difference from distance = (98 - 0) * 0.5 = 49
      expect(closeScore - farScore).toBeCloseTo(49, 0);
    });

    it('should weight rating at 30%', () => {
      const highRated = { distance: 500, rating: 5.0, acceptanceRate: 0.8 };
      const lowRated = { distance: 500, rating: 3.0, acceptanceRate: 0.8 };

      const highScore = calculateScore(highRated);
      const lowScore = calculateScore(lowRated);

      // Rating difference: (50 - 30) * 0.3 = 6
      expect(highScore - lowScore).toBeCloseTo(6, 0);
    });

    it('should weight acceptance rate at 20%', () => {
      const highAccept = { distance: 500, rating: 4.5, acceptanceRate: 1.0 };
      const lowAccept = { distance: 500, rating: 4.5, acceptanceRate: 0.5 };

      const highScore = calculateScore(highAccept);
      const lowScore = calculateScore(lowAccept);

      // Acceptance difference: (30 - 15) * 0.2 = 3
      expect(highScore - lowScore).toBeCloseTo(3, 0);
    });
  });

  describe('Real-world scenarios', () => {
    it('should prefer nearby average driver over far excellent driver', () => {
      const nearbyAverage = { distance: 200, rating: 4.0, acceptanceRate: 0.7 };
      const farExcellent = { distance: 3000, rating: 5.0, acceptanceRate: 1.0 };

      expect(calculateScore(nearbyAverage)).toBeGreaterThan(
        calculateScore(farExcellent),
      );
    });

    it('should prefer excellent driver at moderate distance', () => {
      const nearbyPoor = { distance: 100, rating: 3.0, acceptanceRate: 0.5 };
      const moderateExcellent = {
        distance: 800,
        rating: 5.0,
        acceptanceRate: 1.0,
      };

      expect(calculateScore(moderateExcellent)).toBeGreaterThan(
        calculateScore(nearbyPoor),
      );
    });

    it('should select best driver from realistic pool', () => {
      const drivers = [
        { driverId: 'a', distance: 300, rating: 4.2, acceptanceRate: 0.85 },
        { driverId: 'b', distance: 150, rating: 4.8, acceptanceRate: 0.92 },
        { driverId: 'c', distance: 600, rating: 4.9, acceptanceRate: 0.95 },
        { driverId: 'd', distance: 100, rating: 3.8, acceptanceRate: 0.7 },
        { driverId: 'e', distance: 450, rating: 4.5, acceptanceRate: 0.88 },
      ];

      const ranked = rankDrivers(drivers);

      // Driver 'b' should be best: close (150m), high rating (4.8), good acceptance (0.92)
      expect(ranked[0].driverId).toBe('b');
    });
  });
});
