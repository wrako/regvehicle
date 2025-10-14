package sk.zzs.vehicle.management.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sk.zzs.vehicle.management.entity.ProviderLog;
import sk.zzs.vehicle.management.repository.ProviderLogRepository;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProviderLogService {
    private final ProviderLogRepository repo;

    public ProviderLogService(ProviderLogRepository repo) {
        this.repo = repo;
    }

    public List<ProviderLog> getAllForProvider(Long providerId) {
        return repo.findByProviderIdOrderByTimestampDesc(providerId);
    }

    public List<ProviderLog> getAll() {
        return repo.findAll();
    }
}
