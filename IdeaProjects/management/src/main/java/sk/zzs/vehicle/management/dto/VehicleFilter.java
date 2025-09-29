package sk.zzs.vehicle.management.dto;

import java.time.LocalDate;

public record VehicleFilter(
        String q,                // generic search: license plate, etc.
        String status,           // e.g. active, reserved, ...
        String provider,         // provider name (string in your entity)
        LocalDate stkValidFrom,  // filter expiryDateSTK >=
        LocalDate stkValidTo     // filter expiryDateSTK <=
) {}
