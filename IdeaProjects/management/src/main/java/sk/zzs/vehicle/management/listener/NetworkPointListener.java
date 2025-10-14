package sk.zzs.vehicle.management.listener;

import jakarta.persistence.PostPersist;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;
import sk.zzs.vehicle.management.entity.NetworkPoint;
import sk.zzs.vehicle.management.entity.NetworkPointLog;
import sk.zzs.vehicle.management.enumer.OperationType;
import sk.zzs.vehicle.management.util.CurrentUserProvider;
import sk.zzs.vehicle.management.util.NetworkPointLogRepositoryHolder;

import java.time.LocalDateTime;

public class NetworkPointListener {

    @PostPersist
    public void onPostPersist(NetworkPoint networkPoint) {
        saveLog(networkPoint, OperationType.CREATE);
    }

    @PreUpdate
    public void onPreUpdate(NetworkPoint networkPoint) {
        saveLog(networkPoint, OperationType.UPDATE);
    }

    @PreRemove
    public void onPreRemove(NetworkPoint networkPoint) {
        saveLog(networkPoint, OperationType.DELETE);
    }

    private void saveLog(NetworkPoint networkPoint, OperationType op) {
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
        log.setOperation(op);
        NetworkPointLogRepositoryHolder.getRepository().save(log);
    }
}
