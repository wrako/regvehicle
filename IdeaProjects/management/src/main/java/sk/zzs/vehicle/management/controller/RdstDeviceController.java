package sk.zzs.vehicle.management.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import sk.zzs.vehicle.management.entity.Provider;
import sk.zzs.vehicle.management.entity.RdstDevice;
import sk.zzs.vehicle.management.service.RdstDeviceService;

import java.util.List;

@RestController
@RequestMapping("/rdst-devices")
@CrossOrigin(origins = "*")
public class RdstDeviceController {
    private final RdstDeviceService service;
    public RdstDeviceController(RdstDeviceService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RdstDevice add(@RequestBody RdstDevice body) { return service.add(body); }

    @PutMapping("/{id}")
    public RdstDevice edit(@PathVariable Long id, @RequestBody RdstDevice body) { return service.edit(id, body); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }

    @GetMapping
    public List<RdstDevice> getAll() { return service.getAll(); }

    @GetMapping("/{id}")
    public RdstDevice getRdstDevice(@PathVariable Long id) { return service.findById(id); }


}
