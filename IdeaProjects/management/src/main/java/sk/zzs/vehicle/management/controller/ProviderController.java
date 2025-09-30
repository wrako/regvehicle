package sk.zzs.vehicle.management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import sk.zzs.vehicle.management.dto.ProviderDto;
import sk.zzs.vehicle.management.service.NetworkPointService;
import sk.zzs.vehicle.management.service.ProviderService;
import sk.zzs.vehicle.management.service.VehicleService;

import java.util.List;

@RestController
@RequestMapping("/providers")
@CrossOrigin(origins = "*")
public class ProviderController {

    @Autowired
    private ProviderService providerService;

    @GetMapping
    public List<ProviderDto> getAllProviders() {
        return providerService.getAllProviders();
    }

    @GetMapping("/{id}")
    public ProviderDto getProvider(@PathVariable Long id) {
        return providerService.getProviderById(id);
    }

    @GetMapping("/vehicles/{id}")
    public long getProviderVehicles(@PathVariable Long id) {
        return providerService.getProviderVehicles(id);
    }

    @GetMapping("/network-point/{id}")
    public long getProviderNetworkPoints(@PathVariable Long id) {
        return providerService.getProviderNetworkPoints(id);
    }


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProviderDto createProvider(@RequestBody ProviderDto providerDto) {
        return providerService.createProvider(providerDto);
    }

    @PutMapping("/{id}")
    public ProviderDto updateProvider(@PathVariable Long id, @RequestBody ProviderDto providerDto) {
        return providerService.updateProvider(id, providerDto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProvider(@PathVariable Long id) {
        providerService.deleteProvider(id);
    }




}
