package sk.zzs.vehicle.management.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import sk.zzs.vehicle.management.repository.ProviderLogRepository;

@Component
public class ProviderLogRepositoryHolder {

    private static ProviderLogRepository repository;

    @Autowired
    public ProviderLogRepositoryHolder(ProviderLogRepository repo) {
        repository = repo;
    }

    public static ProviderLogRepository getRepository() {
        return repository;
    }
}
