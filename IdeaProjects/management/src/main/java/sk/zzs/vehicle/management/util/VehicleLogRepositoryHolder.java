package sk.zzs.vehicle.management.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import sk.zzs.vehicle.management.repository.VehicleLogRepository;

@Component
public class VehicleLogRepositoryHolder {

    private static VehicleLogRepository repository;

    @Autowired
    public VehicleLogRepositoryHolder(VehicleLogRepository repo) {
        repository = repo;
    }

    public static VehicleLogRepository getRepository() {
        return repository;
    }
}
