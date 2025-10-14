package sk.zzs.vehicle.management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import sk.zzs.vehicle.management.dto.NetworkPointDto;
import sk.zzs.vehicle.management.dto.NetworkPointMapper;
import sk.zzs.vehicle.management.entity.NetworkPoint;
import sk.zzs.vehicle.management.entity.NetworkPointLog;
import sk.zzs.vehicle.management.entity.Provider;
import sk.zzs.vehicle.management.enumer.OperationType;
import sk.zzs.vehicle.management.repository.NetworkPointLogRepository;
import sk.zzs.vehicle.management.repository.NetworkPointRepository;
import sk.zzs.vehicle.management.repository.ProviderRepository;
import sk.zzs.vehicle.management.repository.VehicleRepository;
import sk.zzs.vehicle.management.util.CurrentUserProvider;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

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

    @Autowired
    private NetworkPointQueueService queueService;

    @Autowired
    @Lazy
    private ProviderService providerService;

    @Autowired
    private NetworkPointLogRepository networkPointLogRepository;

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

    public NetworkPointDto createNetworkPoint(NetworkPointDto dto, boolean bypassCapacityCheck) {
        // Validate: NetworkPoint validTo is REQUIRED
        if (dto.getValidTo() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "NetworkPoint validTo date is required");
        }

        // Validate: EXACTLY ONE provider is REQUIRED on create
        if (dto.getQueueProviderId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Exactly one provider is required when creating a NetworkPoint");
        }

        if (dto.getProviderRegistrationEndDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Provider registration end date is required");
        }

        NetworkPoint entity = networkPointMapper.toEntity(dto);

        // Auto-set validFrom to TODAY
        entity.setValidFrom(LocalDate.now());

        Provider queueProvider = providerRepository.findById(dto.getQueueProviderId())
                .orElseThrow(() -> CrudUtils.notFound("Provider", dto.getQueueProviderId()));

        // Owner is MANDATORY and always equals the active (current) provider
        // On create, the queue provider becomes current, so set owner to queue provider
        entity.setOwner(queueProvider);

        // Enforce capacity rule for queue provider (unless bypassed)
        ensureProviderCapacity(queueProvider.getId(), /*assigningOneMore*/ true, bypassCapacityCheck);

        // Save NetworkPoint first
        NetworkPoint saved = networkPointRepository.save(entity);

        // Add provider to queue (becomes current, position 0, start date = TODAY)
        queueService.addProviderToQueue(saved.getId(), dto.getQueueProviderId(), dto.getProviderRegistrationEndDate());
        refreshProviderStates(queueProvider.getId());

        return networkPointMapper.toDto(saved);
    }

    public NetworkPointDto updateNetworkPoint(Long id, NetworkPointDto dto) {
        NetworkPoint entity = networkPointRepository.findById(id)
                .orElseThrow(() -> CrudUtils.notFound("NetworkPoint", id));

        Long previousOwnerId = entity.getOwner() != null ? entity.getOwner().getId() : null;

        // Map updatable fields (name, type, dates, etc.)
        networkPointMapper.copyToEntity(dto, entity);

        // Owner is MANDATORY and always equals the current (active) provider from queue
        // Update owner to match current provider after any queue changes
        Provider currentProvider = entity.getCurrentProvider();
        entity.setOwner(currentProvider);

        NetworkPoint saved = networkPointRepository.save(entity);
        refreshProviderStates(previousOwnerId, currentProvider != null ? currentProvider.getId() : null);
        return networkPointMapper.toDto(saved);
    }

    public void deleteNetworkPoint(Long id) {
        NetworkPoint entity = networkPointRepository.findById(id)
                .orElseThrow(() -> CrudUtils.notFound("NetworkPoint", id));

        Long ownerId = entity.getOwner() != null ? entity.getOwner().getId() : null;

        // NetworkPoints can now be deleted freely since they're not directly referenced by vehicles
        networkPointRepository.delete(entity);
        refreshProviderStates(ownerId);
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
     * If the requirement is not met and bypass is false, throws 409 with the message:
     * "Provider has only N vehicles but must have X vehicles."
     *
     * If bypass is true, logs a warning instead of throwing an exception.
     */
    private void ensureProviderCapacity(Long providerId, boolean assigningOneMore, boolean bypassCapacityCheck) {
        long nn = networkPointRepository.countByProviderId(providerId);
        if (assigningOneMore) {
            // we are about to add one more NP, so check against (nn + 1)
            nn = nn + 1;
        }
        long required = (long) Math.ceil(1.3 * nn);
        long have = vehicleRepository.countByProviderId(providerId);

        if (have < required) {
            String message = "Provider " + providerId + " has only " + have + " vehicles but should have " + required + " vehicles.";

            if (bypassCapacityCheck) {
                // Log warning but allow assignment
                System.out.println("⚠️ CAPACITY CHECK BYPASSED: " + message);
            } else {
                // Block assignment
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Provider has only " + have + " vehicles but must have " + required + " vehicles."
                );
            }
        }
    }

    public NetworkPointDto archiveNetworkPoint(Long id, String reason) {
        NetworkPoint existing = networkPointRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "NetworkPoint not found: " + id));

        // Clear entire queue when archiving
        Long ownerId = existing.getOwner() != null ? existing.getOwner().getId() : null;

        queueService.clearQueue(id);

        // Log ARCHIVE operation before saving
        createManualLog(existing, OperationType.ARCHIVE);

        existing.setArchived(true);
        networkPointRepository.save(existing);
        refreshProviderStates(ownerId);
        return networkPointMapper.toDto(existing);
    }

    public NetworkPointDto unarchiveNetworkPoint(Long id, Long newProviderId, LocalDate providerEndDate, LocalDate npValidTo, boolean bypassCapacityCheck) {
        NetworkPoint archivedRef = networkPointRepository.findArchivedById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Archived network point not found: " + id));

        // Validate: provider, providerEndDate, and npValidTo are ALL REQUIRED on unarchive
        if (newProviderId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provider is required when unarchiving network point");
        }
        if (providerEndDate == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provider registration end date is required");
        }
        if (npValidTo == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "NetworkPoint validity end date is required");
        }

        // Validate: endDate must be AFTER today
        if (!providerEndDate.isAfter(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Provider registration end date must be in the future (after today)");
        }

        if (!npValidTo.isAfter(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "NetworkPoint validity end date must be in the future (after today)");
        }

        Provider newProvider = providerRepository.findById(newProviderId)
                .orElseThrow(() -> CrudUtils.notFound("Provider", newProviderId));

        // Enforce capacity rule (unless bypassed)
        ensureProviderCapacity(newProvider.getId(), /*assigningOneMore*/ true, bypassCapacityCheck);

        int updated = networkPointRepository.unarchiveById(id);
        if (updated == 0) throw new ResponseStatusException(NOT_FOUND, "NetworkPoint not found: " + id);

        NetworkPoint np = networkPointRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "NetworkPoint not found after unarchive: " + id));

        Long previousOwnerId = np.getOwner() != null ? np.getOwner().getId() : null;

        np.setArchived(false);
        // Set new validFrom to TODAY and new validTo
        np.setValidFrom(LocalDate.now());
        np.setValidTo(npValidTo);

        // Owner is MANDATORY and equals the active provider
        // Set owner to the new provider (will become current)
        np.setOwner(newProvider);

        // Initialize queue with new provider (becomes current, position 0, start date = TODAY)
        queueService.addProviderToQueue(id, newProviderId, providerEndDate);

        // Log UNARCHIVE operation
        createManualLog(np, OperationType.UNARCHIVE);

        networkPointRepository.save(np);
        refreshProviderStates(previousOwnerId, newProvider.getId());
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

    /**
     * Manually create a log entry for operations not captured by entity listeners (ARCHIVE, UNARCHIVE)
     */
    private void createManualLog(NetworkPoint networkPoint, OperationType operation) {
        NetworkPointLog log = new NetworkPointLog();
        log.setNetworkPointId(networkPoint.getId());
        log.setCode(networkPoint.getCode());
        log.setName(networkPoint.getName());
        log.setType(networkPoint.getType());
        log.setValidFrom(networkPoint.getValidFrom());
        log.setValidTo(networkPoint.getValidTo());
        log.setArchived(networkPoint.isArchived());

        // Capture provider information at time of operation
        if (networkPoint.getOwner() != null) {
            log.setProviderId(networkPoint.getOwner().getId());
            log.setProviderName(networkPoint.getOwner().getName());
        }

        log.setAuthor(CurrentUserProvider.getUsernameOrSystem());
        log.setTimestamp(LocalDateTime.now());
        log.setOperation(operation);
        networkPointLogRepository.save(log);
    }

    private void refreshProviderStates(Long... providerIds) {
        if (providerService == null || providerIds == null) {
            return;
        }

        java.util.Arrays.stream(providerIds)
                .filter(Objects::nonNull)
                .distinct()
                .forEach(providerService::refreshStateForProvider);
    }
}
