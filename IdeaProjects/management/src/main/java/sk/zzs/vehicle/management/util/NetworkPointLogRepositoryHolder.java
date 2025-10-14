package sk.zzs.vehicle.management.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import sk.zzs.vehicle.management.repository.NetworkPointLogRepository;

@Component
public class NetworkPointLogRepositoryHolder {

    private static NetworkPointLogRepository repository;

    @Autowired
    public NetworkPointLogRepositoryHolder(NetworkPointLogRepository repo) {
        repository = repo;
    }

    public static NetworkPointLogRepository getRepository() {
        return repository;
    }
}
