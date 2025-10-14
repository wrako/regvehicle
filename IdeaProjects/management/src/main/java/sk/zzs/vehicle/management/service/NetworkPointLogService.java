package sk.zzs.vehicle.management.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sk.zzs.vehicle.management.entity.NetworkPointLog;
import sk.zzs.vehicle.management.repository.NetworkPointLogRepository;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class NetworkPointLogService {
    private final NetworkPointLogRepository repo;

    public NetworkPointLogService(NetworkPointLogRepository repo) {
        this.repo = repo;
    }

    public List<NetworkPointLog> getAllForNetworkPoint(Long networkPointId) {
        return repo.findByNetworkPointIdOrderByTimestampDesc(networkPointId);
    }

    public List<NetworkPointLog> getAll() {
        return repo.findAll();
    }
}
