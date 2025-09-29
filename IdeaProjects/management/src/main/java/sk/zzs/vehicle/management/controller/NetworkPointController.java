package sk.zzs.vehicle.management.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import sk.zzs.vehicle.management.entity.AvlDevice;
import sk.zzs.vehicle.management.entity.NetworkPoint;
import sk.zzs.vehicle.management.service.NetworkPointService;

import java.util.List;

@RestController
@RequestMapping("/network-points")
@CrossOrigin(origins = "*")
public class NetworkPointController {
    private final NetworkPointService service;
    public NetworkPointController(NetworkPointService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NetworkPoint add(@RequestBody NetworkPoint body) { return service.add(body); }

    @PutMapping("/{id}")
    public NetworkPoint edit(@PathVariable Long id, @RequestBody NetworkPoint body) { return service.edit(id, body); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }

    @GetMapping
    public List<NetworkPoint> getAll() { return service.getAll(); }

    @GetMapping("/{id}")
    public NetworkPoint getNetworkPoint(@PathVariable Long id) { return service.findById(id); }

}
