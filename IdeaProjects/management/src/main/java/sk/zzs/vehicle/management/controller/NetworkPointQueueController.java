package sk.zzs.vehicle.management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import sk.zzs.vehicle.management.dto.ProviderNetworkPointRegistrationDto;
import sk.zzs.vehicle.management.entity.ProviderNetworkPointRegistration;
import sk.zzs.vehicle.management.repository.ProviderNetworkPointRegistrationRepository;
import sk.zzs.vehicle.management.service.NetworkPointQueueService;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for managing NetworkPoint provider queue operations
 */
@RestController
@RequestMapping("/network-points")
@CrossOrigin(origins = "*")
public class NetworkPointQueueController {

    @Autowired
    private NetworkPointQueueService queueService;

    @Autowired
    private ProviderNetworkPointRegistrationRepository registrationRepository;

    /**
     * Get queue for a specific network point
     */
    @GetMapping("/{networkPointId}/queue")
    public List<ProviderNetworkPointRegistrationDto> getQueue(@PathVariable Long networkPointId) {
        return registrationRepository.findByNetworkPointIdOrderByQueuePositionAsc(networkPointId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Add provider to queue
     */
    @PostMapping("/{networkPointId}/queue")
    @ResponseStatus(HttpStatus.CREATED)
    public void addToQueue(
            @PathVariable Long networkPointId,
            @RequestParam Long providerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        queueService.addProviderToQueue(networkPointId, providerId, endDate);
    }

    /**
     * Remove provider from queue by registration ID
     */
    @DeleteMapping("/{networkPointId}/queue/{registrationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFromQueue(
            @PathVariable Long networkPointId,
            @PathVariable Long registrationId) {
        queueService.removeFromQueue(registrationId);
    }

    /**
     * Promote next provider in queue to current
     */
    @PostMapping("/{networkPointId}/queue/promote-next")
    public void promoteNext(@PathVariable Long networkPointId) {
        queueService.promoteNext(networkPointId);
    }

    /**
     * Clear entire queue for a network point
     */
    @DeleteMapping("/{networkPointId}/queue")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clearQueue(@PathVariable Long networkPointId) {
        queueService.clearQueue(networkPointId);
    }

    /**
     * Update registration start and/or end date
     */
    @PutMapping("/{networkPointId}/queue/{registrationId}")
    public void updateRegistrationDates(
            @PathVariable Long networkPointId,
            @PathVariable Long registrationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        queueService.updateRegistrationDates(registrationId, startDate, endDate);
    }

    /**
     * Reorder queue - provide list of registration IDs in desired order
     */
    @PutMapping("/{networkPointId}/queue/reorder")
    public void reorderQueue(
            @PathVariable Long networkPointId,
            @RequestBody List<Long> registrationIds) {
        queueService.reorderQueue(networkPointId, registrationIds);
    }

    private ProviderNetworkPointRegistrationDto toDto(ProviderNetworkPointRegistration reg) {
        if (reg == null) return null;

        String providerName = null;
        try {
            if (reg.getProvider() != null) {
                providerName = reg.getProvider().getName();
            }
        } catch (Exception e) {
            providerName = null;
        }

        return ProviderNetworkPointRegistrationDto.builder()
                .id(reg.getId())
                .networkPointId(reg.getNetworkPoint() != null ? reg.getNetworkPoint().getId() : null)
                .providerId(reg.getProvider() != null ? reg.getProvider().getId() : null)
                .providerName(providerName)
                .registrationStartDate(reg.getRegistrationStartDate())
                .registrationEndDate(reg.getRegistrationEndDate())
                .queuePosition(reg.getQueuePosition())
                .current(reg.isCurrent())
                .build();
    }
}
