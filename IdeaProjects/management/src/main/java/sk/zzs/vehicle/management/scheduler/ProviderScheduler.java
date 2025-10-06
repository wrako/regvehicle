package sk.zzs.vehicle.management.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import sk.zzs.vehicle.management.service.ProviderService;

import java.util.Map;

@Component
public class ProviderScheduler {

    @Autowired
    private ProviderService providerService;

    /**
     * Daily job at 02:10 to archive Providers with zero active NetworkPoints.
     * Runs at 02:10 every day using cron expression.
     */
    @Scheduled(cron = "0 0 1 * * *")
    public void archiveProvidersWithoutNetworkPoints() {
        Map<String, Object> result = providerService.checkAndArchiveProvidersWithoutNetworkPoints();
        System.out.println("Scheduled provider empty check completed: " + result);
    }
}
