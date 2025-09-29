package sk.zzs.vehicle.management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.zzs.vehicle.management.entity.NetworkPoint;

public interface NetworkPointRepository extends JpaRepository<NetworkPoint, Long> {}
