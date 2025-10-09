package sk.zzs.vehicle.management.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import sk.zzs.vehicle.management.service.VehicleService;

import java.util.Map;

@Component
public class VehicleScheduler {

    @Autowired
    private VehicleService vehicleService;

    /**
     * Daily job at 01:00 to archive vehicles with expired provider assignments.
     * Runs at 01:00 every day using cron expression.
     */
    @Scheduled(cron = "0 1 16 * * *")
    public void archiveExpiredVehicles() {
        Map<String, Object> result = vehicleService.checkAndArchiveExpiredVehicles();
        System.out.println("Scheduled vehicle expiration check completed: " + result);
    }
}
