package sk.zzs.vehicle.management.repository;

import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import sk.zzs.vehicle.management.dto.VehicleFilter;
import sk.zzs.vehicle.management.entity.Vehicle;
import sk.zzs.vehicle.management.entity.Provider;
import sk.zzs.vehicle.management.entity.NetworkPoint;

import java.time.LocalDate;
import java.util.Locale;

public final class VehicleSpecifications {

    private VehicleSpecifications() {}

    public static Specification<Vehicle> withFilter(VehicleFilter f) {
        Specification<Vehicle> spec = Specification.where(null);
        if (f == null) return spec;

        if (notBlank(f.q()))              spec = spec.and(textSearch(f.q()));
        if (notBlank(f.provider()))       spec = spec.and(providerMatches(f.provider()));
        if (f.stkValidFrom() != null)     spec = spec.and(stkFrom(f.stkValidFrom()));
        if (f.stkValidTo() != null)       spec = spec.and(stkTo(f.stkValidTo()));

        return spec;
    }

    /* -------- helpers -------- */

    private static boolean notBlank(String s) { return s != null && !s.isBlank(); }

    /** Case-insensitive LIKE pattern */
    private static String like(String q) { return "%" + q.toLowerCase(Locale.ROOT) + "%"; }

    /** Full-text-ish search across common fields (LP/brand/model/provider/network point). */
    private static Specification<Vehicle> textSearch(String q) {
        return (root, cq, cb) -> {
            var like = like(q);

            // joins (LEFT so nulls are allowed)
            var provider = root.join("provider", JoinType.LEFT);
            var point    = root.join("networkPoint", JoinType.LEFT);

            return cb.or(
                    cb.like(cb.lower(root.get("licensePlate")), like),
                    cb.like(cb.lower(root.get("brand")), like),
                    cb.like(cb.lower(root.get("model")), like),
                    cb.like(cb.lower(provider.get("name")), like),
                    cb.like(cb.lower(provider.get("providerId")), like),
                    cb.like(cb.lower(point.get("name")), like),
                    cb.like(cb.lower(point.get("code")), like)
            );
        };
    }

    /** Provider filter: match either providerId (exact, case-insensitive) OR name (ILIKE). */
    private static Specification<Vehicle> providerMatches(String providerText) {
        return (root, cq, cb) -> {
            var p = root.join("provider", JoinType.LEFT);
            String v = providerText.toLowerCase(Locale.ROOT);
            return cb.or(
                    cb.equal(cb.lower(p.get("providerId")), v),
                    cb.like(cb.lower(p.get("name")), like(providerText))
            );
        };
    }

    /** STK validity window on Vehicle.technicalCheckValidUntil */
    private static Specification<Vehicle> stkFrom(LocalDate from) {
        return (root, cq, cb) -> cb.greaterThanOrEqualTo(root.get("technicalCheckValidUntil"), from);
    }

    private static Specification<Vehicle> stkTo(LocalDate to) {
        return (root, cq, cb) -> cb.lessThanOrEqualTo(root.get("technicalCheckValidUntil"), to);
    }
}
