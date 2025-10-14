package sk.zzs.vehicle.management.listener;

import jakarta.persistence.PostPersist;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;
import sk.zzs.vehicle.management.entity.Provider;
import sk.zzs.vehicle.management.entity.ProviderLog;
import sk.zzs.vehicle.management.enumer.OperationType;
import sk.zzs.vehicle.management.util.CurrentUserProvider;
import sk.zzs.vehicle.management.util.ProviderLogRepositoryHolder;

import java.time.LocalDateTime;

public class ProviderListener {

    @PostPersist
    public void onPostPersist(Provider provider) {
        saveLog(provider, OperationType.CREATE);
    }

    @PreUpdate
    public void onPreUpdate(Provider provider) {
        saveLog(provider, OperationType.UPDATE);
    }

    @PreRemove
    public void onPreRemove(Provider provider) {
        saveLog(provider, OperationType.DELETE);
    }

    private void saveLog(Provider provider, OperationType op) {
        ProviderLog log = new ProviderLog();
        log.setProviderId(provider.getId());
        log.setName(provider.getName());
        log.setEmail(provider.getEmail());
        log.setProviderIdField(provider.getProviderId());
        log.setAddress(provider.getAddress());
        log.setState(provider.getState());
        log.setArchived(provider.isArchived());

        log.setAuthor(CurrentUserProvider.getUsernameOrSystem());
        log.setTimestamp(LocalDateTime.now());
        log.setOperation(op);
        ProviderLogRepositoryHolder.getRepository().save(log);
    }
}
