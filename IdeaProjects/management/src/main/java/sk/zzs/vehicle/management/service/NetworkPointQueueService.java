package sk.zzs.vehicle.management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import sk.zzs.vehicle.management.entity.NetworkPoint;
import sk.zzs.vehicle.management.entity.Provider;
import sk.zzs.vehicle.management.entity.ProviderNetworkPointRegistration;
import sk.zzs.vehicle.management.repository.NetworkPointRepository;
import sk.zzs.vehicle.management.repository.ProviderNetworkPointRegistrationRepository;
import sk.zzs.vehicle.management.repository.ProviderRepository;

import java.time.LocalDate;
import java.util.List;

/**
 * Service for managing NetworkPoint provider queue operations
 */
@Service
@Transactional
public class NetworkPointQueueService {

    @Autowired
    private NetworkPointRepository networkPointRepository;

    @Autowired
    private ProviderNetworkPointRegistrationRepository registrationRepository;

    @Autowired
    private ProviderRepository providerRepository;

    @Autowired
    @Lazy
    private NetworkPointService networkPointService;

    @Autowired
    @Lazy
    private ProviderService providerService;

    /**
     * Add a provider to the queue
     * If this is the first provider (queue was empty), it becomes current and owner is updated
     */
    public void addProviderToQueue(Long networkPointId, Long providerId, LocalDate endDate) {
        NetworkPoint np = networkPointRepository.findById(networkPointId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "NetworkPoint not found"));

        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Provider not found"));

        List<ProviderNetworkPointRegistration> queue = registrationRepository
                .findByNetworkPointIdOrderByQueuePositionAsc(networkPointId);

        boolean isFirstProvider = queue.isEmpty();

        ProviderNetworkPointRegistration registration = new ProviderNetworkPointRegistration();
        registration.setNetworkPoint(np);
        registration.setProvider(provider);
        registration.setRegistrationStartDate(LocalDate.now());
        registration.setRegistrationEndDate(endDate);
        registration.setQueuePosition(queue.size()); // Add to end
        registration.setCurrent(isFirstProvider); // First one is current

        registrationRepository.save(registration);

        // If this is the first provider, update owner to match
        if (isFirstProvider) {
            Long previousOwnerId = np.getOwner() != null ? np.getOwner().getId() : null;
            np.setOwner(provider);
            networkPointRepository.save(np);
            refreshProviderStates(previousOwnerId, provider.getId());
        }
    }

    /**
     * Remove a provider from the queue by registration ID
     * Updates owner if the removed provider was current
     */
    public void removeFromQueue(Long registrationId) {
        ProviderNetworkPointRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found"));

        boolean wasCurrent = registration.isCurrent() && registration.getQueuePosition() == 0;
        Long networkPointId = registration.getNetworkPoint().getId();

        registrationRepository.delete(registration);

        // Reindex queue positions
        reindexQueue(networkPointId);

        // If removed was current, promote next (this will also update owner)
        if (wasCurrent) {
            promoteNext(networkPointId);
        }
    }

    /**
     * Promote the next provider in queue to current
     * Also updates NetworkPoint owner to match the new current provider
     */
    public void promoteNext(Long networkPointId) {
        NetworkPoint np = networkPointRepository.findById(networkPointId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "NetworkPoint not found"));

        List<ProviderNetworkPointRegistration> queue = registrationRepository
                .findByNetworkPointIdOrderByQueuePositionAsc(networkPointId);

        // Clear current flag on all
        queue.forEach(reg -> reg.setCurrent(false));

        Long previousOwnerId = np.getOwner() != null ? np.getOwner().getId() : null;
        Long newOwnerId = null;

        // Set first as current if exists
        if (!queue.isEmpty()) {
            ProviderNetworkPointRegistration first = queue.get(0);
            first.setCurrent(true);
            first.setQueuePosition(0);
            registrationRepository.save(first);

            // Owner is MANDATORY and must equal current provider
            np.setOwner(first.getProvider());
            newOwnerId = first.getProvider() != null ? first.getProvider().getId() : null;
        } else {
            // No providers in queue, owner becomes null
            np.setOwner(null);
        }

        registrationRepository.saveAll(queue);
        networkPointRepository.save(np);
        refreshProviderStates(previousOwnerId, newOwnerId);
    }

    /**
     * Reindex queue positions after removal
     */
    private void reindexQueue(Long networkPointId) {
        List<ProviderNetworkPointRegistration> queue = registrationRepository
                .findByNetworkPointIdOrderByQueuePositionAsc(networkPointId);

        for (int i = 0; i < queue.size(); i++) {
            queue.get(i).setQueuePosition(i);
        }

        registrationRepository.saveAll(queue);
    }

    /**
     * Clear entire queue for a network point
     */
    public void clearQueue(Long networkPointId) {
        registrationRepository.deleteByNetworkPointId(networkPointId);
    }

    /**
     * Remove all registrations for a provider (when user archive provider)
     * Archives NetworkPoints if their queue becomes empty
     */
    public void removeProviderFromAllQueues(Long providerId) {
        List<ProviderNetworkPointRegistration> registrations = registrationRepository.findByProviderId(providerId);

        for (ProviderNetworkPointRegistration reg : registrations) {
            Long networkPointId = reg.getNetworkPoint().getId();
            boolean wasCurrent = reg.isCurrent() && reg.getQueuePosition() == 0;

            registrationRepository.delete(reg);
            reindexQueue(networkPointId);

            if (wasCurrent) {
                promoteNext(networkPointId);
            }

            // If queue is now empty, archive the NetworkPoint
            if (hasEmptyQueue(networkPointId)) {
                try {
                    networkPointService.archiveNetworkPoint(networkPointId, "Empty queue after provider removal");
                } catch (Exception e) {
                    System.err.println("Failed to archive NetworkPoint " + networkPointId + ": " + e.getMessage());
                }
            }
        }
    }

    /**
     * Check if a network point has an empty queue
     */
    public boolean hasEmptyQueue(Long networkPointId) {
        List<ProviderNetworkPointRegistration> queue = registrationRepository
                .findByNetworkPointIdOrderByQueuePositionAsc(networkPointId);
        return queue.isEmpty();
    }

    /**
     * Update a registration's start and/or end date
     */
    public void updateRegistrationDates(Long registrationId, LocalDate newStartDate, LocalDate newEndDate) {
        if (newStartDate == null && newEndDate == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one date is required");
        }

        ProviderNetworkPointRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found"));

        if (newStartDate != null) {
            registration.setRegistrationStartDate(newStartDate);
        }
        if (newEndDate != null) {
            registration.setRegistrationEndDate(newEndDate);
        }
        registrationRepository.save(registration);
    }

    /**
     * Reorder queue entries - provide list of registration IDs in desired order
     */
    public void reorderQueue(Long networkPointId, List<Long> registrationIds) {
        if (registrationIds == null || registrationIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration IDs are required");
        }

        List<ProviderNetworkPointRegistration> queue = registrationRepository
                .findByNetworkPointIdOrderByQueuePositionAsc(networkPointId);

        // Validate all IDs exist and belong to this network point
        if (queue.size() != registrationIds.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Registration IDs count does not match queue size");
        }

        // Reorder based on provided IDs
        for (int i = 0; i < registrationIds.size(); i++) {
            Long regId = registrationIds.get(i);
            ProviderNetworkPointRegistration reg = queue.stream()
                    .filter(r -> r.getId().equals(regId))
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Registration ID " + regId + " not found in queue"));

            reg.setQueuePosition(i);
            // First position is current
            reg.setCurrent(i == 0);
        }

        registrationRepository.saveAll(queue);
    }

    private void refreshProviderStates(Long... providerIds) {
        if (providerService == null || providerIds == null) {
            return;
        }

        java.util.Arrays.stream(providerIds)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .forEach(providerService::refreshStateForProvider);
    }

}
