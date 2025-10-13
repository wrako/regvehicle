package sk.zzs.vehicle.management.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import sk.zzs.vehicle.management.entity.ProviderNetworkPointRegistration;
import sk.zzs.vehicle.management.repository.NetworkPointRepository;
import sk.zzs.vehicle.management.repository.ProviderNetworkPointRegistrationRepository;
import sk.zzs.vehicle.management.service.NetworkPointQueueService;
import sk.zzs.vehicle.management.service.NetworkPointService;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Scheduler for handling expiration of:
 * 1. NetworkPoint validity (validTo) - archives NetworkPoint
 * 2. Provider registrations in queue - promotes next provider
 */
@Component
public class ExpirationScheduler {

    @Autowired
    private NetworkPointService networkPointService;

    @Autowired
    private ProviderNetworkPointRegistrationRepository registrationRepository;

    @Autowired
    private NetworkPointQueueService queueService;

    /**
     * SCHEDULED EVENT 1: Check and promote next provider for expired registrations
     * Runs daily at 00:05 AM (5 minutes after midnight)
     *
     * Process:
     * 1. Find all current provider registrations with endDate < today
     * 2. Remove expired registration
     * 3. Promote next provider in queue (updates owner automatically)
     * 4. If queue becomes empty, archive the NetworkPoint
     */
    @Scheduled(cron = "0 23 11 * * *")
    @Transactional
    public void promoteExpiredRegistrations() {
        System.out.println("=== SCHEDULED EVENT 1: Provider Registration Expiration Check ===");
        System.out.println("Running at: " + java.time.LocalDateTime.now());
        LocalDate today = LocalDate.now();
        List<ProviderNetworkPointRegistration> expired = registrationRepository.findExpiredCurrentRegistrations(today);

        int promoted = 0;
        int archived = 0;
        List<String> errors = new ArrayList<>();

        for (ProviderNetworkPointRegistration reg : expired) {
            try {
                Long networkPointId = reg.getNetworkPoint().getId();
                Long providerId = reg.getProvider().getId();

                System.out.println("Processing expired registration: NP=" + networkPointId +
                                 ", Provider=" + providerId +
                                 ", EndDate=" + reg.getRegistrationEndDate());

                // Remove expired registration
                registrationRepository.delete(reg);

                // Promote next in queue (also updates owner to new current provider)
                queueService.promoteNext(networkPointId);

                // If queue is now empty, archive the NetworkPoint
                if (queueService.hasEmptyQueue(networkPointId)) {
                    networkPointService.archiveNetworkPoint(networkPointId, "Empty queue after registration expiration");
                    System.out.println("  → Queue empty, NetworkPoint archived");
                    archived++;
                } else {
                    System.out.println("  → Next provider promoted to current");
                    promoted++;
                }
            } catch (Exception e) {
                String error = "Failed to handle expired registration " + reg.getId() + ": " + e.getMessage();
                System.err.println("  ✗ " + error);
                errors.add(error);
            }
        }

        System.out.println("=== EVENT 1 COMPLETED ===");
        System.out.println("Total expired: " + expired.size());
        System.out.println("Promoted: " + promoted);
        System.out.println("Archived: " + archived);
        System.out.println("Errors: " + errors.size());
        if (!errors.isEmpty()) {
            System.err.println("Error details: " + errors);
        }
        System.out.println("=====================================\n");
    }

    /**
     * SCHEDULED EVENT 2: Check and archive expired NetworkPoints
     * Runs daily at 00:10 AM (10 minutes after midnight, after provider promotions)
     *
     * Process:
     * 1. Find all NetworkPoints with validTo < today and not archived
     * 2. Archive each NetworkPoint (clears queue, sets owner to null)
     */
    @Scheduled(cron = "0 23 11 * * *")
    public void archiveExpiredNetworkPoints() {
        System.out.println("=== SCHEDULED EVENT 2: NetworkPoint Expiration Check ===");
        System.out.println("Running at: " + java.time.LocalDateTime.now());
        var result = networkPointService.checkAndArchiveExpiredNetworkPoints();
        System.out.println("=== EVENT 2 COMPLETED ===");
        System.out.println("Result: " + result);
        System.out.println("=====================================\n");
    }
}
