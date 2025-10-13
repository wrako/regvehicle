package sk.zzs.vehicle.management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sk.zzs.vehicle.management.entity.ProviderNetworkPointRegistration;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ProviderNetworkPointRegistrationRepository extends JpaRepository<ProviderNetworkPointRegistration, Long> {

    /**
     * Find all registrations for a specific network point, ordered by queue position
     */
    List<ProviderNetworkPointRegistration> findByNetworkPointIdOrderByQueuePositionAsc(Long networkPointId);

    /**
     * Find the current provider registration (position 0, current = true) for a network point
     */
    @Query("SELECT r FROM ProviderNetworkPointRegistration r WHERE r.networkPoint.id = :networkPointId AND r.queuePosition = 0 AND r.current = true")
    Optional<ProviderNetworkPointRegistration> findCurrentByNetworkPointId(@Param("networkPointId") Long networkPointId);

    /**
     * Find all registrations for a specific provider
     */
    List<ProviderNetworkPointRegistration> findByProviderId(Long providerId);

    /**
     * Find all expired current provider registrations (position 0, endDate < today)
     */
    @Query("SELECT r FROM ProviderNetworkPointRegistration r WHERE r.current = true AND r.queuePosition = 0 AND r.registrationEndDate < :date")
    List<ProviderNetworkPointRegistration> findExpiredCurrentRegistrations(@Param("date") LocalDate date);

    /**
     * Delete all registrations for a network point
     */
    void deleteByNetworkPointId(Long networkPointId);

    /**
     * Delete all registrations for a provider
     */
    void deleteByProviderId(Long providerId);
}
