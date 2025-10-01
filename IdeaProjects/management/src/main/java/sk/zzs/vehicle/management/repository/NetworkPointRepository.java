package sk.zzs.vehicle.management.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import sk.zzs.vehicle.management.entity.NetworkPoint;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface NetworkPointRepository extends JpaRepository<NetworkPoint, Long> {

    @Query("SELECT COUNT(np) FROM NetworkPoint np WHERE np.provider.id = :providerId")
    long countByProviderId(@Param("providerId") Long providerId);

    @Transactional
    @Modifying
    @Query("""
        update NetworkPoint np
           set np.archived = true
         where np.id = :id
    """)
    int archiveById(@Param("id") Long id);

    @Transactional
    @Modifying
    @Query(value = "UPDATE network_point SET archived = false WHERE id = :id AND archived = true", nativeQuery = true)
    int unarchiveById(@Param("id") Long id);

    @Query(
            value = "SELECT * FROM network_point np WHERE np.archived = true",
            countQuery = "SELECT count(*) FROM network_point np WHERE np.archived = true",
            nativeQuery = true
    )
    Page<NetworkPoint> findArchivedNative(Pageable pageable);

    @Query(value = "SELECT * FROM network_point WHERE id = :id AND archived = true", nativeQuery = true)
    Optional<NetworkPoint> findArchivedById(@Param("id") Long id);

    @Query("SELECT np FROM NetworkPoint np WHERE np.validTo < :today AND np.archived = false")
    List<NetworkPoint> findExpiredCandidates(@Param("today") LocalDate today);

}
