package sk.zzs.vehicle.management.controller;

import org.springframework.web.bind.annotation.*;
import sk.zzs.vehicle.management.entity.NetworkPointLog;
import sk.zzs.vehicle.management.service.NetworkPointLogService;

import java.util.List;

@RestController
@RequestMapping("/network-point-logs")
@CrossOrigin(origins = "*")
public class NetworkPointLogController {
    private final NetworkPointLogService service;

    public NetworkPointLogController(NetworkPointLogService service) {
        this.service = service;
    }

    @GetMapping
    public List<NetworkPointLog> getAll() {
        return service.getAll();
    }

    @GetMapping("/history/{id}")
    public List<NetworkPointLog> getNetworkPointLogs(@PathVariable Long id) {
        return service.getAllForNetworkPoint(id);
    }
}
