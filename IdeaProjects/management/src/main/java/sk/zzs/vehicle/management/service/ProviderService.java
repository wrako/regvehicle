package sk.zzs.vehicle.management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import sk.zzs.vehicle.management.dto.ProviderDto;
import sk.zzs.vehicle.management.dto.ProviderMapper;
import sk.zzs.vehicle.management.entity.NetworkPoint;
import sk.zzs.vehicle.management.entity.Provider;
import sk.zzs.vehicle.management.entity.Vehicle;
import sk.zzs.vehicle.management.repository.ProviderRepository;
import sk.zzs.vehicle.management.repository.VehicleRepository;
import sk.zzs.vehicle.management.repository.NetworkPointRepository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@Transactional
public class ProviderService {

    private static final String STATE_ACTIVE = "ACTIVE";
    private static final String STATE_DISABLED = "DISABLED";
    private static final String STATE_UNBALANCED = "UNBALANCED";
    @Autowired
    private ProviderRepository providerRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private NetworkPointRepository networkPointRepository;

    @Autowired
    private ProviderMapper providerMapper;

    @Autowired
    @Lazy
    private VehicleService vehicleService;

    @Autowired
    @Lazy
    private NetworkPointQueueService queueService;

    @Autowired
    @Lazy
    private NetworkPointService networkPointService;

    @Transactional(readOnly = true)
    public List<ProviderDto> getAllProviders() {
        return providerRepository.findAll()
                .stream()
                .map(providerMapper::toDtoWithoutNetworkPoints)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProviderDto getProviderById(Long id) {
        return providerRepository.findById(id)
                .map(providerMapper::toDto)
                .orElseThrow(() -> CrudUtils.notFound("Provider", id));
    }

    public ProviderDto createProvider(ProviderDto dto) {
        Provider entity = providerMapper.toEntity(dto);
        entity.setState(determineState(
                entity.getVehicles() != null ? entity.getVehicles().size() : 0,
                entity.getNetworkPoints() != null ? entity.getNetworkPoints().size() : 0));
        Provider saved = providerRepository.save(entity);
        refreshStateForProvider(saved.getId());
        return providerMapper.toDto(saved);
    }

    public ProviderDto updateProvider(Long id, ProviderDto dto) {
        Provider entity = providerRepository.findById(id)
                .orElseThrow(() -> CrudUtils.notFound("Provider", id));

        providerMapper.copyToEntity(dto, entity);
        Provider saved = providerRepository.save(entity);
        refreshStateForProvider(saved.getId());
        return providerMapper.toDto(saved);
    }

    public void deleteProvider(Long id) {
        if (!providerRepository.existsById(id)) {
            throw CrudUtils.notFound("Provider", id);
        }

        // Check if provider is referenced by vehicles
        long vehicleCount = vehicleRepository.countByProviderId(id);
        if (vehicleCount > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Cannot delete provider: " + vehicleCount + " vehicles are using this provider");
        }

        // Check if provider is referenced by network points
        long networkPointCount = networkPointRepository.countByProviderId(id);
        if (networkPointCount > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Cannot delete provider: " + networkPointCount + " network points are using this provider");
        }

        providerRepository.deleteById(id);
    }

    // Legacy method for Vehicle service
    public Provider findById(Long id) {
        return providerRepository.getReferenceById(id);
    }


    public long getProviderVehicles(Long id) {
        return vehicleRepository.countByProviderId(id);
    }

    public long getProviderNetworkPoints(Long id) {
        return networkPointRepository.countByProviderId(id);
    }

    public ProviderDto archiveProvider(Long id, String reason) {
        Provider existing = providerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Provider not found: " + id));

        // Archive all vehicles owned by this provider
        List<Vehicle> vehicles = existing.getVehicles();
        for (Vehicle vehicle : vehicles) {
            if (!vehicle.isArchived()) {
                vehicleService.archiveVehicle(
                    vehicle.getId(),
                    "Provider archived: " + (reason != null ? reason : "")
                );
            }
        }

        // Remove provider from all NetworkPoint queues
        // This will promote next in queue or archive NetworkPoint if queue becomes empty
        queueService.removeProviderFromAllQueues(id);

        // Clear owner relationship on owned NetworkPoints (metadata only)
        List<NetworkPoint> ownedNetworkPoints = existing.getNetworkPoints();
        for (NetworkPoint np : ownedNetworkPoints) {
            if (!np.isArchived()) {
                np.setOwner(null);
            }
        }

        existing.setArchived(true);
        existing.setState(STATE_DISABLED);
        providerRepository.save(existing);
        return providerMapper.toDto(existing);
    }

    public boolean unarchiveProvider(Long id) {
        int updated = providerRepository.unarchiveById(id);
        if (updated == 0) throw new ResponseStatusException(NOT_FOUND, "Provider not found: " + id);

        refreshStateForProvider(id);
        return true;
    }

    public Page<ProviderDto> getArchived(Pageable pageable) {
        return providerRepository.findArchivedNative(pageable).map(providerMapper::toDto);
    }

    public ProviderDto getArchivedById(Long id) {
        return providerRepository.findArchivedById(id)
                .map(providerMapper::toDto)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Archived provider not found: " + id));
    }

    public void refreshStateForProvider(Long providerId) {
        if (providerId == null) {
            return;
        }

        providerRepository.findByIdIncludingArchived(providerId).ifPresent(provider -> {
            String state = determineState(
                    vehicleRepository.countByProviderId(providerId),
                    networkPointRepository.countByProviderId(providerId));
            if (!Objects.equals(state, provider.getState())) {
                provider.setState(state);
                providerRepository.save(provider);
            } else if (provider.getState() == null) {
                provider.setState(state);
                providerRepository.save(provider);
            }
        });
    }

    private String determineState(long vehicleCount, long networkPointCount) {
        if (vehicleCount == 0 && networkPointCount == 0) {
            return STATE_DISABLED;
        }

        if (networkPointCount > 0) {
            long requiredVehicles = (long) Math.ceil(networkPointCount * 1.3d);
            if (vehicleCount < requiredVehicles) {
                return STATE_UNBALANCED;
            }
        }

        return STATE_ACTIVE;
    }

}
