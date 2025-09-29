package sk.zzs.vehicle.management.service;

import org.springframework.stereotype.Service;
import sk.zzs.vehicle.management.entity.AvlDevice;
import sk.zzs.vehicle.management.entity.Provider;
import sk.zzs.vehicle.management.repository.AvlDeviceRepository;

import java.util.List;

@Service
public class AvlDeviceService {
    private final AvlDeviceRepository repo;
    public AvlDeviceService(AvlDeviceRepository repo) { this.repo = repo; }

    public AvlDevice add(AvlDevice e) { return repo.save(e); }

    public AvlDevice edit(Long id, AvlDevice e) {
        if (!repo.existsById(id)) throw CrudUtils.notFound("AvlDevice", id);
        e.setId(id);
        return repo.save(e);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw CrudUtils.notFound("AvlDevice", id);
        repo.deleteById(id);
    }

    public List<AvlDevice> getAll() { return repo.findAll(); }

    public AvlDevice findById(Long id) {
        return repo.getReferenceById(id);
    }

}
