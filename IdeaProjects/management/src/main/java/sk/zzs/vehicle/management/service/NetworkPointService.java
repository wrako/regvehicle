package sk.zzs.vehicle.management.service;

import org.springframework.stereotype.Service;
import sk.zzs.vehicle.management.entity.NetworkPoint;
import sk.zzs.vehicle.management.entity.Provider;
import sk.zzs.vehicle.management.repository.NetworkPointRepository;

import java.util.List;

@Service
public class NetworkPointService {
    private final NetworkPointRepository repo;
    public NetworkPointService(NetworkPointRepository repo) { this.repo = repo; }

    public NetworkPoint add(NetworkPoint e) { return repo.save(e); }

    public NetworkPoint edit(Long id, NetworkPoint e) {
        if (!repo.existsById(id)) throw CrudUtils.notFound("NetworkPoint", id);
        e.setId(id);
        return repo.save(e);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw CrudUtils.notFound("NetworkPoint", id);
        repo.deleteById(id);
    }

    public NetworkPoint findById(Long id) {
        return repo.getReferenceById(id);
    }
    public List<NetworkPoint> getAll() { return repo.findAll(); }
}
