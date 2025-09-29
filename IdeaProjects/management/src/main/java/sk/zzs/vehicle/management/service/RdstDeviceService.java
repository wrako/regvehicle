package sk.zzs.vehicle.management.service;

import org.springframework.stereotype.Service;
import sk.zzs.vehicle.management.entity.Provider;
import sk.zzs.vehicle.management.entity.RdstDevice;
import sk.zzs.vehicle.management.repository.RdstDeviceRepository;

import java.util.List;

@Service
public class RdstDeviceService {
    private final RdstDeviceRepository repo;
    public RdstDeviceService(RdstDeviceRepository repo) { this.repo = repo; }

    public RdstDevice add(RdstDevice e) { return repo.save(e); }

    public RdstDevice edit(Long id, RdstDevice e) {
        if (!repo.existsById(id)) throw CrudUtils.notFound("RdstDevice", id);
        e.setId(id);
        return repo.save(e);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw CrudUtils.notFound("RdstDevice", id);
        repo.deleteById(id);
    }

    public RdstDevice findById(Long id) {
        return repo.getReferenceById(id);
    }

    public List<RdstDevice> getAll() { return repo.findAll(); }
}
