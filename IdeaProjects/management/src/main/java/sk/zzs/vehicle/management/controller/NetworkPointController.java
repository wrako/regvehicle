package sk.zzs.vehicle.management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import sk.zzs.vehicle.management.dto.NetworkPointDto;
import sk.zzs.vehicle.management.service.NetworkPointService;

import java.util.List;

@RestController
@RequestMapping("/network-points")
@CrossOrigin(origins = "*")
public class NetworkPointController {

    @Autowired
    private NetworkPointService networkPointService;

    @GetMapping
    public List<NetworkPointDto> getAllNetworkPoints() {
        return networkPointService.getAllNetworkPoints();
    }

    @GetMapping("/{id}")
    public NetworkPointDto getNetworkPoint(@PathVariable Long id) {
        return networkPointService.getNetworkPointById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NetworkPointDto createNetworkPoint(@RequestBody NetworkPointDto networkPointDto) {
        return networkPointService.createNetworkPoint(networkPointDto);
    }

    @PutMapping("/{id}")
    public NetworkPointDto updateNetworkPoint(@PathVariable Long id, @RequestBody NetworkPointDto networkPointDto) {
        return networkPointService.updateNetworkPoint(id, networkPointDto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteNetworkPoint(@PathVariable Long id) {
        networkPointService.deleteNetworkPoint(id);
    }

    @PostMapping("/{id}/archive")
    public NetworkPointDto archive(@PathVariable Long id,
                                    @RequestParam(value = "reason", required = false) String reason) {
        return networkPointService.archiveNetworkPoint(id, reason);
    }

    @PostMapping("/{id}/unarchive")
    public NetworkPointDto unarchive(@PathVariable Long id) {
        return networkPointService.unarchiveNetworkPoint(id);
    }

    @GetMapping("/archived/page")
    public Page<NetworkPointDto> getArchivedPaged(Pageable pageable) {
        return networkPointService.getArchived(pageable);
    }

    @GetMapping("/archived/{id}")
    public NetworkPointDto getArchivedNetworkPoint(@PathVariable Long id) {
        return networkPointService.getArchivedById(id);
    }
}
