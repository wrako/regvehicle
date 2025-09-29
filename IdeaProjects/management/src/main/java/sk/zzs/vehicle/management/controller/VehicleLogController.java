package sk.zzs.vehicle.management.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import sk.zzs.vehicle.management.entity.VehicleLog;
import sk.zzs.vehicle.management.service.VehicleLogService;

import java.util.List;

@RestController
@RequestMapping("/vehicle-logs")
@CrossOrigin(origins = "*")
public class VehicleLogController {
    private final VehicleLogService service;
    public VehicleLogController(VehicleLogService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VehicleLog add(@RequestBody VehicleLog body) { return service.add(body); }

    @PutMapping("/{id}")
    public VehicleLog edit(@PathVariable Long id, @RequestBody VehicleLog body) { return service.edit(id, body); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }

    @GetMapping
    public List<VehicleLog> getAll() { return service.getAll(); }

    @GetMapping("/history/{id}")
    public List<VehicleLog> getVehicleLogs(@PathVariable Long id) {
        return service.getAllForVehicle(id);
    }
}
