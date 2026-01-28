-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Master tenant registry (public schema)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    schema_name VARCHAR(100) NOT NULL UNIQUE,
    region VARCHAR(50) NOT NULL DEFAULT 'default',
    config JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create default tenant schema
CREATE SCHEMA IF NOT EXISTS tenant_default;

-- Insert default tenant
INSERT INTO public.tenants (id, name, schema_name, region)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Tenant', 'tenant_default', 'default')
ON CONFLICT (schema_name) DO NOTHING;

-- Function to create tenant schema with all tables
CREATE OR REPLACE FUNCTION create_tenant_schema(tenant_schema_name VARCHAR)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', tenant_schema_name);

    -- Set search path to new schema
    EXECUTE format('SET search_path TO %I', tenant_schema_name);

    -- Create riders table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.riders (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL UNIQUE,
            email VARCHAR(255),
            default_payment_method VARCHAR(50) DEFAULT ''CASH'',
            rating DECIMAL(2,1) DEFAULT 5.0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )', tenant_schema_name);

    -- Create drivers table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.drivers (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL UNIQUE,
            email VARCHAR(255),
            vehicle_number VARCHAR(50) NOT NULL,
            vehicle_type VARCHAR(20) NOT NULL,
            status VARCHAR(20) DEFAULT ''OFFLINE'',
            rating DECIMAL(2,1) DEFAULT 5.0,
            current_location GEOGRAPHY(POINT, 4326),
            last_location_update TIMESTAMPTZ,
            acceptance_rate DECIMAL(3,2) DEFAULT 1.00,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )', tenant_schema_name);

    -- Create rides table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.rides (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            rider_id UUID NOT NULL,
            driver_id UUID,
            idempotency_key VARCHAR(255),
            pickup_latitude DECIMAL(10, 8) NOT NULL,
            pickup_longitude DECIMAL(11, 8) NOT NULL,
            pickup_address TEXT,
            destination_latitude DECIMAL(10, 8) NOT NULL,
            destination_longitude DECIMAL(11, 8) NOT NULL,
            destination_address TEXT,
            tier VARCHAR(20) NOT NULL,
            status VARCHAR(30) DEFAULT ''PENDING'',
            payment_method VARCHAR(50) NOT NULL,
            estimated_fare_min DECIMAL(10,2),
            estimated_fare_max DECIMAL(10,2),
            surge_multiplier DECIMAL(3,2) DEFAULT 1.00,
            requested_at TIMESTAMPTZ DEFAULT NOW(),
            driver_assigned_at TIMESTAMPTZ,
            driver_arrived_at TIMESTAMPTZ,
            cancelled_at TIMESTAMPTZ,
            cancellation_reason TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT unique_ride_idempotency UNIQUE (idempotency_key)
        )', tenant_schema_name);

    -- Create trips table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.trips (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            ride_id UUID NOT NULL,
            driver_id UUID NOT NULL,
            rider_id UUID NOT NULL,
            status VARCHAR(20) DEFAULT ''NOT_STARTED'',
            start_latitude DECIMAL(10, 8),
            start_longitude DECIMAL(11, 8),
            end_latitude DECIMAL(10, 8),
            end_longitude DECIMAL(11, 8),
            route_polyline TEXT,
            distance_meters INTEGER,
            duration_seconds INTEGER,
            base_fare DECIMAL(10,2),
            distance_fare DECIMAL(10,2),
            time_fare DECIMAL(10,2),
            surge_amount DECIMAL(10,2),
            taxes DECIMAL(10,2),
            total_fare DECIMAL(10,2),
            started_at TIMESTAMPTZ,
            paused_at TIMESTAMPTZ,
            ended_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )', tenant_schema_name);

    -- Create payments table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.payments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            trip_id UUID NOT NULL,
            rider_id UUID NOT NULL,
            idempotency_key VARCHAR(255),
            amount DECIMAL(10,2) NOT NULL,
            currency VARCHAR(3) DEFAULT ''INR'',
            payment_method VARCHAR(50) NOT NULL,
            status VARCHAR(20) DEFAULT ''PENDING'',
            psp_name VARCHAR(50),
            psp_transaction_id VARCHAR(255),
            psp_response JSONB,
            initiated_at TIMESTAMPTZ DEFAULT NOW(),
            completed_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT unique_payment_idempotency UNIQUE (idempotency_key)
        )', tenant_schema_name);

    -- Create ride_offers table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.ride_offers (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            ride_id UUID NOT NULL,
            driver_id UUID NOT NULL,
            offered_at TIMESTAMPTZ DEFAULT NOW(),
            response VARCHAR(20),
            responded_at TIMESTAMPTZ,
            timeout_seconds INTEGER DEFAULT 15,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )', tenant_schema_name);

    -- Create indexes
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_drivers_status ON %I.drivers (status)',
        replace(tenant_schema_name, 'tenant_', ''), tenant_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_drivers_location ON %I.drivers USING GIST (current_location)',
        replace(tenant_schema_name, 'tenant_', ''), tenant_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_rides_status ON %I.rides (status)',
        replace(tenant_schema_name, 'tenant_', ''), tenant_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_rides_rider ON %I.rides (rider_id)',
        replace(tenant_schema_name, 'tenant_', ''), tenant_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_rides_driver ON %I.rides (driver_id)',
        replace(tenant_schema_name, 'tenant_', ''), tenant_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_trips_ride ON %I.trips (ride_id)',
        replace(tenant_schema_name, 'tenant_', ''), tenant_schema_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_payments_trip ON %I.payments (trip_id)',
        replace(tenant_schema_name, 'tenant_', ''), tenant_schema_name);

    -- Reset search path
    SET search_path TO public;
END;
$$ LANGUAGE plpgsql;

-- Create the default tenant schema with tables
SELECT create_tenant_schema('tenant_default');

-- Grant permissions
GRANT ALL ON SCHEMA tenant_default TO ridehailing;
GRANT ALL ON ALL TABLES IN SCHEMA tenant_default TO ridehailing;
