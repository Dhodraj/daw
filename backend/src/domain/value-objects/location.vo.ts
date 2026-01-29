/**
 * Location Value Object
 * Immutable representation of a geographic location
 */
export class Location {
  private constructor(
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly address?: string,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.latitude < -90 || this.latitude > 90) {
      throw new Error(
        `Invalid latitude: ${this.latitude}. Must be between -90 and 90.`,
      );
    }
    if (this.longitude < -180 || this.longitude > 180) {
      throw new Error(
        `Invalid longitude: ${this.longitude}. Must be between -180 and 180.`,
      );
    }
  }

  /**
   * Factory method to create a Location
   */
  static create(
    latitude: number,
    longitude: number,
    address?: string,
  ): Location {
    return new Location(latitude, longitude, address);
  }

  /**
   * Reconstitute from persistence
   */
  static fromPersistence(
    latitude: number | string,
    longitude: number | string,
    address?: string | null,
  ): Location {
    return new Location(
      typeof latitude === 'string' ? parseFloat(latitude) : latitude,
      typeof longitude === 'string' ? parseFloat(longitude) : longitude,
      address || undefined,
    );
  }

  /**
   * Calculate distance to another location using Haversine formula
   * Returns distance in meters
   */
  distanceTo(other: Location): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(other.latitude - this.latitude);
    const dLon = this.toRadians(other.longitude - this.longitude);
    const lat1 = this.toRadians(this.latitude);
    const lat2 = this.toRadians(other.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Check equality with another location
   */
  equals(other: Location): boolean {
    return (
      this.latitude === other.latitude &&
      this.longitude === other.longitude &&
      this.address === other.address
    );
  }

  /**
   * Create a copy with updated address
   */
  withAddress(address: string): Location {
    return new Location(this.latitude, this.longitude, address);
  }

  /**
   * Serialize to plain object
   */
  toJSON(): { latitude: number; longitude: number; address?: string } {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
      ...(this.address && { address: this.address }),
    };
  }
}
