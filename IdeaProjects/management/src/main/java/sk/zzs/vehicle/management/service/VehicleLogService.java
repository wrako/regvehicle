package sk.zzs.vehicle.management.service;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import sk.zzs.vehicle.management.entity.VehicleLog;
import sk.zzs.vehicle.management.repository.VehicleLogRepository;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class VehicleLogService {
    private final VehicleLogRepository repo;
    public VehicleLogService(VehicleLogRepository repo) { this.repo = repo; }

    public VehicleLog add(VehicleLog e) { return repo.save(e); }

    public VehicleLog edit(Long id, VehicleLog e) {
        if (!repo.existsById(id)) throw CrudUtils.notFound("VehicleLog", id);
        e.setId(id);
        return repo.save(e);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw CrudUtils.notFound("VehicleLog", id);
        repo.deleteById(id);
    }


    public List<VehicleLog> getAllForVehicle(Long vehicleId) {
        // (Optional) ensure vehicle exists → 404 if not
//        if (!repo.existsById(vehicleId)) {
//            throw new ResponseStatusException(NOT_FOUND, "Vehicle not found: " + vehicleId);
//        }
        return repo.findByVehicleIdOrderByTimestampDesc(vehicleId);
    }

    public List<VehicleLog> getAll() { return repo.findAll(); }
}
