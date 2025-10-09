package sk.zzs.vehicle.management.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import sk.zzs.vehicle.management.entity.Vehicle;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


public interface VehicleRepository extends JpaRepository<Vehicle, Long> , JpaSpecificationExecutor<Vehicle> {

    // NEW: active-only due to @Where on Vehicle
    Optional<Vehicle> findByVinNum(String vinNum);
    boolean existsByVinNum(String vinNum);

    @Transactional
    @Modifying
    @Query("""
        update Vehicle v
           set v.archived = true
         where v.id = :id
    """)
    int archiveById(@Param("id") Long id,
                    @Param("user") String user,
                    @Param("reason") String reason);

    //               v.archivedAt = CURRENT_TIMESTAMP,
//               v.archivedBy = :user,
//               v.archivedReason = :reason

    @Transactional
    @Modifying
    @Query(value = "UPDATE vehicle SET archived = false WHERE id = :id AND archived = true", nativeQuery = true)
    int unarchiveById(@Param("id") Long id);

    //               v.archivedAt = null,
//               v.archivedBy = null,
//               v.archivedReason = null
    @Query(
            value = "SELECT * FROM vehicle v WHERE v.archived = true",
            countQuery = "SELECT count(*) FROM vehicle v WHERE v.archived = true",
            nativeQuery = true
    )
    Page<Vehicle> findArchivedNative(Pageable pageable);

    @Query(value = "SELECT * FROM vehicle WHERE id = :id AND archived = true", nativeQuery = true)
    Optional<Vehicle> findArchivedById(@Param("id") Long id);

    @Query("SELECT COUNT(v) FROM Vehicle v WHERE v.provider.id = :providerId")
    long countByProviderId(@Param("providerId") Long providerId);

    /**
     * Find all active (non-archived) vehicles whose provider assignment has expired.
     * Due to @Where(clause = "archived = false") on Vehicle entity, this will only return active vehicles.
     */
    @Query("SELECT v FROM Vehicle v WHERE v.providerAssignmentEndDate < :date AND v.provider IS NOT NULL")
    List<Vehicle> findExpiredAssignments(@Param("date") LocalDate date);

}
