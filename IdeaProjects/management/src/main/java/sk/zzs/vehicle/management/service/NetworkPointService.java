package sk.zzs.vehicle.management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.NOT_FOUND;

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

    public NetworkPointDto archiveNetworkPoint(Long id, String reason) {
        NetworkPoint existing = networkPointRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "NetworkPoint not found: " + id));

        // Because of @Where, the managed entity may still read archived=false until cleared/refresh.
        // Return a DTO based on known state:
        existing.setArchived(true);
        return networkPointMapper.toDto(existing);
    }

    public NetworkPointDto unarchiveNetworkPoint(Long id) {
        NetworkPoint archivedRef = networkPointRepository.findArchivedById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Archived network point not found: " + id));

        // Enforce capacity rule if provider exists
        if (archivedRef.getProvider() != null) {
            ensureProviderCapacity(archivedRef.getProvider().getId(), /*assigningOneMore*/ true);
        }

        int updated = networkPointRepository.unarchiveById(id);
        if (updated == 0) throw new ResponseStatusException(NOT_FOUND, "NetworkPoint not found: " + id);

        // Reload (optional) if you need full data; @Where will show it now since archived=false.
        NetworkPoint np = networkPointRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "NetworkPoint not found after unarchive: " + id));

        return networkPointMapper.toDto(np);
    }

    public Page<NetworkPointDto> getArchived(Pageable pageable) {
        return networkPointRepository.findArchivedNative(pageable).map(networkPointMapper::toDto);
    }

    public NetworkPointDto getArchivedById(Long id) {
        return networkPointRepository.findArchivedById(id)
                .map(networkPointMapper::toDto)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Archived network point not found: " + id));
    }

    /**
     * Scans all NetworkPoints and archives expired ones.
     * NetworkPoint is expired if validTo != null AND validTo < today.
     * Returns JSON summary: { checked, archived, skippedArchived, errors?[] }
     */
    public Map<String, Object> checkAndArchiveExpiredNetworkPoints() {
        LocalDate today = LocalDate.now();
        List<NetworkPoint> candidates = networkPointRepository.findExpiredCandidates(today);

        int checked = candidates.size();
        int archived = 0;
        int skippedArchived = 0;
        List<String> errors = new ArrayList<>();

        for (NetworkPoint np : candidates) {
            try {
                String reason = "Expired (validTo=" + np.getValidTo() + ")";
                archiveNetworkPoint(np.getId(), reason);
                archived++;
            } catch (Exception e) {
                errors.add("NetworkPoint " + np.getId() + ": " + e.getMessage());
                skippedArchived++;
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("checked", checked);
        result.put("archived", archived);
        result.put("skippedArchived", skippedArchived);
        if (!errors.isEmpty()) {
            result.put("errors", errors);
        }
        return result;
    }
}
