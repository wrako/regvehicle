package sk.zzs.vehicle.management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.zzs.vehicle.management.entity.ProviderLog;

import java.util.List;

public interface ProviderLogRepository extends JpaRepository<ProviderLog, Long> {

    List<ProviderLog> findByProviderIdOrderByTimestampDesc(Long providerId);

}
