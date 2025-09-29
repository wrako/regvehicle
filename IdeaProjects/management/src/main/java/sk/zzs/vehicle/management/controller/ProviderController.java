package sk.zzs.vehicle.management.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import sk.zzs.vehicle.management.entity.NetworkPoint;
import sk.zzs.vehicle.management.entity.Provider;
import sk.zzs.vehicle.management.service.ProviderService;

import java.util.List;

@RestController
@RequestMapping("/providers")
@CrossOrigin(origins = "*")
public class ProviderController {
    private final ProviderService service;
    public ProviderController(ProviderService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Provider add(@RequestBody Provider body) { return service.add(body); }

    @PutMapping("/{id}")
    public Provider edit(@PathVariable Long id, @RequestBody Provider body) { return service.edit(id, body); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }

    @GetMapping
    public List<Provider> getAll() { return service.getAll(); }

    @GetMapping("/{id}")
    public Provider getProvider(@PathVariable Long id) { return service.findById(id); }

}
