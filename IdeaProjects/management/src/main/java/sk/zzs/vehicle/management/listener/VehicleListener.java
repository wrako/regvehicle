package sk.zzs.vehicle.management.listener;

import jakarta.persistence.PostPersist;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;
import sk.zzs.vehicle.management.entity.Vehicle;
import sk.zzs.vehicle.management.entity.VehicleLog;
import sk.zzs.vehicle.management.enumer.OperationType;
import sk.zzs.vehicle.management.util.CurrentUserProvider;
import sk.zzs.vehicle.management.util.VehicleLogRepositoryHolder;

import java.time.LocalDateTime;

public class VehicleListener {

    @PostPersist
    public void onPostPersist(Vehicle vehicle) {
        saveLog(vehicle, OperationType.CREATE);
    }

    @PreUpdate
    public void onPreUpdate(Vehicle vehicle) {
        saveLog(vehicle, OperationType.UPDATE);
    }

    @PreRemove
    public void onPreRemove(Vehicle vehicle) {
        saveLog(vehicle, OperationType.DELETE);
    }

    private void saveLog(Vehicle vehicle, OperationType op) {
        VehicleLog log = new VehicleLog();
        log.setVehicleId(vehicle.getId());
        log.setLicensePlate(vehicle.getLicensePlate());
        log.setVinNum(vehicle.getVinNum());
        log.setBrand(vehicle.getBrand());
        log.setModel(vehicle.getModel());
        log.setFirstRegistrationDate(vehicle.getFirstRegistrationDate());
        log.setLastTechnicalCheckDate(vehicle.getLastTechnicalCheckDate());
        log.setTechnicalCheckValidUntil(vehicle.getTechnicalCheckValidUntil());

        // Capture provider information at time of operation
        if (vehicle.getProvider() != null) {
            log.setProviderId(vehicle.getProvider().getId());
            log.setProviderName(vehicle.getProvider().getName());
        }

        log.setAuthor(CurrentUserProvider.getUsernameOrSystem());
        log.setTimestamp(LocalDateTime.now());
        log.setOperation(op);
        VehicleLogRepositoryHolder.getRepository().save(log);
    }
}
