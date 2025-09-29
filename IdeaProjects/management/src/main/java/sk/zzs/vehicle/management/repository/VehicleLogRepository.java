package sk.zzs.vehicle.management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.zzs.vehicle.management.entity.VehicleLog;

import java.util.List;

public interface VehicleLogRepository extends JpaRepository<VehicleLog, Long> {

    List<VehicleLog> findByVehicleIdOrderByTimestampDesc(Long vehicleId);

}
