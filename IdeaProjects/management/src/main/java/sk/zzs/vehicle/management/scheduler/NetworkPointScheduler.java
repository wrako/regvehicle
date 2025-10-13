package sk.zzs.vehicle.management.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import sk.zzs.vehicle.management.service.NetworkPointService;

import java.util.Map;

@Component
public class NetworkPointScheduler {

    @Autowired
    private NetworkPointService networkPointService;

    /**
     * Daily job at 02:05 to archive expired NetworkPoints.
     * Runs at 02:05 every day using cron expression.
     */
    @Scheduled(cron = "0 14 11 * * *")
    public void archiveExpiredNetworkPoints() {
        Map<String, Object> result = networkPointService.checkAndArchiveExpiredNetworkPoints();
        System.out.println("Scheduled expiration check completed: " + result);
    }
}
