package sk.zzs.vehicle.management.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import sk.zzs.vehicle.management.entity.Provider;

import java.util.List;
import java.util.Optional;

public interface ProviderRepository extends JpaRepository<Provider, Long> {

    boolean existsByProviderId(String providerId);
    Provider findByProviderId(String providerId);


    @Transactional
    @Modifying
    @Query(value = "UPDATE provider SET archived = false WHERE id = :id AND archived = true", nativeQuery = true)
    int unarchiveById(@Param("id") Long id);

    @Query(
            value = "SELECT * FROM provider WHERE archived = true",
            countQuery = "SELECT count(*) FROM provider WHERE archived = true",
            nativeQuery = true
    )
    Page<Provider> findArchivedNative(Pageable pageable);

    @Query(value = "SELECT * FROM provider WHERE id = :id AND archived = true", nativeQuery = true)
    Optional<Provider> findArchivedById(@Param("id") Long id);

    /**
     * Find provider by ID, ignoring the @Where clause (both active and archived).
     * Used when mapping archived vehicles to include their archived provider.
     */
    @Query(value = "SELECT * FROM provider WHERE id = :id", nativeQuery = true)
    Optional<Provider> findByIdIncludingArchived(@Param("id") Long id);

    /**
     * Find all active providers that have zero active network points.
     * Active = archived=false for both Provider and NetworkPoint.
     */
    @Query(value = """
        SELECT p.* FROM provider p
        WHERE p.archived = false
        AND NOT EXISTS (
            SELECT 1 FROM network_point np
            WHERE np.provider_id = p.id
            AND np.archived = false
        )
        """, nativeQuery = true)
    List<Provider> findActiveProvidersWithoutNetworkPoints();

    /**
     * Find provider by providerId (including archived), ignoring the @Where clause.
     * Used to check for duplicate providerId values.
     */
    @Query(value = "SELECT * FROM provider WHERE provider_id = :providerId", nativeQuery = true)
    Optional<Provider> findByProviderIdIncludingArchived(@Param("providerId") String providerId);
}
