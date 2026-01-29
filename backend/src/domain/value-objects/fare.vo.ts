import { Money } from './money.vo';

/**
 * Fare Breakdown Value Object
 * Represents the complete fare structure for a trip
 */
export class Fare {
  private constructor(
    public readonly baseFare: Money,
    public readonly distanceFare: Money,
    public readonly timeFare: Money,
    public readonly surgeAmount: Money,
    public readonly taxes: Money,
  ) {}

  /**
   * Factory method to create a Fare
   */
  static create(
    baseFare: Money,
    distanceFare: Money,
    timeFare: Money,
    surgeAmount: Money,
    taxes: Money,
  ): Fare {
    return new Fare(baseFare, distanceFare, timeFare, surgeAmount, taxes);
  }

  /**
   * Create from raw values
   */
  static fromValues(
    baseFare: number,
    distanceFare: number,
    timeFare: number,
    surgeAmount: number,
    taxes: number,
    currency: string = 'INR',
  ): Fare {
    return new Fare(
      Money.create(baseFare, currency),
      Money.create(distanceFare, currency),
      Money.create(timeFare, currency),
      Money.create(surgeAmount, currency),
      Money.create(taxes, currency),
    );
  }

  /**
   * Reconstitute from persistence
   */
  static fromPersistence(data: {
    baseFare?: number | string | null;
    distanceFare?: number | string | null;
    timeFare?: number | string | null;
    surgeAmount?: number | string | null;
    taxes?: number | string | null;
    currency?: string;
  }): Fare {
    const currency = data.currency || 'INR';
    return new Fare(
      Money.fromPersistence(data.baseFare ?? 0, currency),
      Money.fromPersistence(data.distanceFare ?? 0, currency),
      Money.fromPersistence(data.timeFare ?? 0, currency),
      Money.fromPersistence(data.surgeAmount ?? 0, currency),
      Money.fromPersistence(data.taxes ?? 0, currency),
    );
  }

  /**
   * Calculate total fare
   */
  get total(): Money {
    return this.baseFare
      .add(this.distanceFare)
      .add(this.timeFare)
      .add(this.surgeAmount)
      .add(this.taxes)
      .round(2);
  }

  /**
   * Get subtotal before taxes
   */
  get subtotal(): Money {
    return this.baseFare
      .add(this.distanceFare)
      .add(this.timeFare)
      .add(this.surgeAmount)
      .round(2);
  }

  /**
   * Calculate tax percentage
   */
  get taxPercentage(): number {
    const subtotalAmount = this.subtotal.amount;
    if (subtotalAmount === 0) return 0;
    return (this.taxes.amount / subtotalAmount) * 100;
  }

  /**
   * Check if surge pricing is applied
   */
  get hasSurge(): boolean {
    return this.surgeAmount.amount > 0;
  }

  /**
   * Create a copy with updated surge amount
   */
  withSurge(surgeAmount: Money): Fare {
    return new Fare(
      this.baseFare,
      this.distanceFare,
      this.timeFare,
      surgeAmount,
      this.taxes,
    );
  }

  /**
   * Check equality
   */
  equals(other: Fare): boolean {
    return (
      this.baseFare.equals(other.baseFare) &&
      this.distanceFare.equals(other.distanceFare) &&
      this.timeFare.equals(other.timeFare) &&
      this.surgeAmount.equals(other.surgeAmount) &&
      this.taxes.equals(other.taxes)
    );
  }

  /**
   * Serialize to plain object
   */
  toJSON(): {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    surgeAmount: number;
    taxes: number;
    total: number;
    currency: string;
  } {
    return {
      baseFare: this.baseFare.amount,
      distanceFare: this.distanceFare.amount,
      timeFare: this.timeFare.amount,
      surgeAmount: this.surgeAmount.amount,
      taxes: this.taxes.amount,
      total: this.total.amount,
      currency: this.baseFare.currency,
    };
  }
}
