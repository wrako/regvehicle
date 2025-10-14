package sk.zzs.vehicle.management.controller;

import org.springframework.web.bind.annotation.*;
import sk.zzs.vehicle.management.entity.ProviderLog;
import sk.zzs.vehicle.management.service.ProviderLogService;

import java.util.List;

@RestController
@RequestMapping("/provider-logs")
@CrossOrigin(origins = "*")
public class ProviderLogController {
    private final ProviderLogService service;

    public ProviderLogController(ProviderLogService service) {
        this.service = service;
    }

    @GetMapping
    public List<ProviderLog> getAll() {
        return service.getAll();
    }

    @GetMapping("/history/{id}")
    public List<ProviderLog> getProviderLogs(@PathVariable Long id) {
        return service.getAllForProvider(id);
    }
}
