package sk.zzs.vehicle.management.service;

import org.springframework.stereotype.Service;
import sk.zzs.vehicle.management.entity.Provider;
import sk.zzs.vehicle.management.repository.ProviderRepository;

import java.util.List;

@Service
public class ProviderService {
    private final ProviderRepository repo;
    public ProviderService(ProviderRepository repo) { this.repo = repo; }

    public Provider add(Provider p) { return repo.save(p); }

    public Provider edit(Long id, Provider p) {
        if (!repo.existsById(id)) throw CrudUtils.notFound("Provider", id);
        p.setId(id); // ensure path id wins
        return repo.save(p);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw CrudUtils.notFound("Provider", id);
        repo.deleteById(id);
    }

    public List<Provider> getAll() { return repo.findAll(); }

    public Provider findById(Long id) {
       return repo.getReferenceById(id);
    }
}
