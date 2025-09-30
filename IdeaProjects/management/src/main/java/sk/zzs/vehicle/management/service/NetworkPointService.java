package sk.zzs.vehicle.management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import sk.zzs.vehicle.management.dto.NetworkPointDto;
import sk.zzs.vehicle.management.dto.NetworkPointMapper;
import sk.zzs.vehicle.management.entity.NetworkPoint;
import sk.zzs.vehicle.management.entity.Provider;
import sk.zzs.vehicle.management.repository.NetworkPointRepository;
import sk.zzs.vehicle.management.repository.ProviderRepository;
import sk.zzs.vehicle.management.repository.VehicleRepository;

import java.util.List;

@Service
@Transactional
public class NetworkPointService {

    @Autowired
    private NetworkPointRepository networkPointRepository;

    @Autowired
    private ProviderRepository providerRepository;

    // NEW: used to count provider vehicles for capacity rule
    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private NetworkPointMapper networkPointMapper;

    @Transactional(readOnly = true)
    public List<NetworkPointDto> getAllNetworkPoints() {
        return networkPointRepository.findAll()
                .stream()
                .map(networkPointMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public NetworkPointDto getNetworkPointById(Long id) {
        return networkPointRepository.findById(id)
                .map(networkPointMapper::toDto)
                .orElseThrow(() -> CrudUtils.notFound("NetworkPoint", id));
    }

    public NetworkPointDto createNetworkPoint(NetworkPointDto dto) {
        // Provider is required for new network points
        if (dto.getProviderId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provider is required for network point creation");
        }

        NetworkPoint entity = networkPointMapper.toEntity(dto);

        Provider provider = providerRepository.findById(dto.getProviderId())
                .orElseThrow(() -> CrudUtils.notFound("Provider", dto.getProviderId()));
        // Enforce capacity rule BEFORE assigning
        ensureProviderCapacity(provider.getId(), /*assigningOneMore*/ true);

        entity.setProvider(provider);

        NetworkPoint saved = networkPointRepository.save(entity);
        return networkPointMapper.toDto(saved);
    }

    public NetworkPointDto updateNetworkPoint(Long id, NetworkPointDto dto) {
        NetworkPoint entity = networkPointRepository.findById(id)
                .orElseThrow(() -> CrudUtils.notFound("NetworkPoint", id));

        // If provider reassignment requested, enforce capacity rule for target provider
        if (dto.getProviderId() != null) {
            Long currentProviderId = entity.getProvider() != null ? entity.getProvider().getId() : null;
            if (!dto.getProviderId().equals(currentProviderId)) {
                Provider newProvider = providerRepository.findById(dto.getProviderId())
                        .orElseThrow(() -> CrudUtils.notFound("Provider", dto.getProviderId()));
                // Enforce capacity WITH this network point added (nn + 1)
                ensureProviderCapacity(newProvider.getId(), /*assigningOneMore*/ true);
                entity.setProvider(newProvider);
            }
        }

        // Map other updatable fields
        networkPointMapper.copyToEntity(dto, entity);

        NetworkPoint saved = networkPointRepository.save(entity);
        return networkPointMapper.toDto(saved);
    }

    public void deleteNetworkPoint(Long id) {
        if (!networkPointRepository.existsById(id)) {
            throw CrudUtils.notFound("NetworkPoint", id);
        }

        // NetworkPoints can now be deleted freely since they're not directly referenced by vehicles
        networkPointRepository.deleteById(id);
    }

    // Legacy method for Vehicle service
    public NetworkPoint findById(Long id) {
        return networkPointRepository.getReferenceById(id);
    }

    /**
     * Ensures the provider has at least ceil(1.3 * (nn + addOne)) vehicles,
     * where nn is current number of network points and addOne indicates whether we're
     * validating for adding this network point now.
     *
     * If the requirement is not met, throws 409 with the message:
     * "Provider has only N vehicles but must have X vehicles."
     */
    private void ensureProviderCapacity(Long providerId, boolean assigningOneMore) {
        long nn = networkPointRepository.countByProviderId(providerId);
        if (assigningOneMore) {
            // we are about to add one more NP, so check against (nn + 1)
            nn = nn + 1;
        }
        long required = (long) Math.ceil(1.3 * nn);
        long have = vehicleRepository.countByProviderId(providerId);

        if (have < required) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Provider has only " + have + " vehicles but must have " + required + " vehicles."
            );
        }
    }
}
