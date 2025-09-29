package sk.zzs.vehicle.management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.zzs.vehicle.management.entity.Provider;

public interface ProviderRepository extends JpaRepository<Provider, Long> {}
