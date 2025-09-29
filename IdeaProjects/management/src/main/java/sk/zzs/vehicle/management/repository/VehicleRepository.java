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

import java.util.Optional;


public interface VehicleRepository extends JpaRepository<Vehicle, Long> , JpaSpecificationExecutor<Vehicle> {

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

}
