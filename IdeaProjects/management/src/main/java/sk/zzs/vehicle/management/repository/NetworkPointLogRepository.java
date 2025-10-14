package sk.zzs.vehicle.management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.zzs.vehicle.management.entity.NetworkPointLog;

import java.util.List;

public interface NetworkPointLogRepository extends JpaRepository<NetworkPointLog, Long> {

    List<NetworkPointLog> findByNetworkPointIdOrderByTimestampDesc(Long networkPointId);

}
