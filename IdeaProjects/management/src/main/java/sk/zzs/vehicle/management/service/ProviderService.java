package sk.zzs.vehicle.management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@Transactional
public class ProviderService {
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
        Provider saved = providerRepository.save(entity);
        return providerMapper.toDto(saved);
    }

    public ProviderDto updateProvider(Long id, ProviderDto dto) {
        Provider entity = providerRepository.findById(id)
                .orElseThrow(() -> CrudUtils.notFound("Provider", id));

        providerMapper.copyToEntity(dto, entity);
        Provider saved = providerRepository.save(entity);
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

        List<Vehicle> vehicles =
            existing.getVehicles();
        for (Vehicle vehicle : vehicles) {
            if (!vehicle.isArchived()) {
                vehicleService.archiveVehicle(
                    vehicle.getId(),
                    "Provider archived: " + (reason != null ? reason : ""),
                    vehicle.getStatus()
                );
            }
        }

        List<NetworkPoint> networkPoints =
            existing.getNetworkPoints();
        for (NetworkPoint np : networkPoints) {
            if (!np.isArchived()) {
                np.setProvider(null);
            }
        }
        existing.setArchived(true);
        return providerMapper.toDto(existing);
    }

    public boolean unarchiveProvider(Long id) {
        int updated = providerRepository.unarchiveById(id);
        if (updated == 0) throw new ResponseStatusException(NOT_FOUND, "Provider not found: " + id);


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


}
