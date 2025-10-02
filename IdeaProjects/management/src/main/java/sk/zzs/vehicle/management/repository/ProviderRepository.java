package sk.zzs.vehicle.management.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import sk.zzs.vehicle.management.entity.Provider;

import java.util.Optional;

public interface ProviderRepository extends JpaRepository<Provider, Long> {

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
}
