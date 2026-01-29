/**
 * Money Value Object
 * Immutable representation of a monetary amount with currency
 */
export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string = 'INR',
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.amount < 0) {
      throw new Error(`Invalid amount: ${this.amount}. Cannot be negative.`);
    }
    if (!this.currency || this.currency.length !== 3) {
      throw new Error(
        `Invalid currency: ${this.currency}. Must be 3-letter ISO code.`,
      );
    }
  }

  /**
   * Factory method to create Money
   */
  static create(amount: number, currency: string = 'INR'): Money {
    return new Money(amount, currency.toUpperCase());
  }

  /**
   * Create zero amount
   */
  static zero(currency: string = 'INR'): Money {
    return new Money(0, currency.toUpperCase());
  }

  /**
   * Reconstitute from persistence (handles Decimal strings)
   */
  static fromPersistence(amount: number | string, currency?: string): Money {
    return new Money(
      typeof amount === 'string' ? parseFloat(amount) : amount,
      (currency || 'INR').toUpperCase(),
    );
  }

  /**
   * Add another Money amount
   */
  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  /**
   * Subtract another Money amount
   */
  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    if (this.amount < other.amount) {
      throw new Error('Cannot subtract: result would be negative');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  /**
   * Multiply by a factor
   */
  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error('Cannot multiply by negative factor');
    }
    return new Money(this.amount * factor, this.currency);
  }

  /**
   * Round to specified decimal places
   */
  round(decimals: number = 2): Money {
    const factor = Math.pow(10, decimals);
    return new Money(Math.round(this.amount * factor) / factor, this.currency);
  }

  /**
   * Check if this amount is greater than another
   */
  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount > other.amount;
  }

  /**
   * Check if this amount is less than another
   */
  isLessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount < other.amount;
  }

  /**
   * Check equality
   */
  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Currency mismatch: ${this.currency} vs ${other.currency}`,
      );
    }
  }

  /**
   * Format for display
   */
  format(): string {
    const symbol = this.currency === 'INR' ? '₹' : this.currency;
    return `${symbol}${this.amount.toFixed(2)}`;
  }

  /**
   * Serialize to plain object
   */
  toJSON(): { amount: number; currency: string } {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }
}
