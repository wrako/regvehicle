package sk.zzs.vehicle.management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sk.zzs.vehicle.management.entity.NetworkPoint;

public interface NetworkPointRepository extends JpaRepository<NetworkPoint, Long> {

    @Query("SELECT COUNT(np) FROM NetworkPoint np WHERE np.provider.id = :providerId")
    long countByProviderId(@Param("providerId") Long providerId);

}
