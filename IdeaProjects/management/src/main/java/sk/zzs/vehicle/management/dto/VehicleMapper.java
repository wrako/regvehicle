package sk.zzs.vehicle.management.dto;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Component;
import sk.zzs.vehicle.management.entity.*;
import sk.zzs.vehicle.management.service.ProviderService;

@Component
public class VehicleMapper {

    private final ProviderService providerService;

    @PersistenceContext
    private EntityManager em;

    public VehicleMapper(ProviderService providerService) {
        this.providerService = providerService;
    }

    public VehicleDto toDto(Vehicle v) {
        if (v == null) return null;

        return VehicleDto.builder()
                .id(v.getId())
                .licensePlate(v.getLicensePlate())
                .vinNum(v.getVinNum())
                .brand(v.getBrand())
                .model(v.getModel())
                .firstRegistrationDate(v.getFirstRegistrationDate())
                .lastTechnicalCheckDate(v.getLastTechnicalCheckDate())
                .technicalCheckValidUntil(v.getTechnicalCheckValidUntil())
                .status(v.getStatus())
                .providerId(v.getProvider() != null ? v.getProvider().getId() : null)
                .providerName(v.getProvider() != null ? v.getProvider().getName() : null)
//                .avlDeviceId(v.getAvlDevice() != null ? v.getAvlDevice().getId() : null)
//                .rdstDeviceId(v.getRdstDevice() != null ? v.getRdstDevice().getId() : null)

                .filePaths(v.getFilePaths())
                .build();
    }

    public Vehicle toEntity(VehicleDto d) {
        if (d == null) return null;

        Vehicle v = new Vehicle();
        v.setId(d.getId());
        v.setLicensePlate(d.getLicensePlate());
        v.setVinNum(d.getVinNum());
        v.setBrand(d.getBrand());
        v.setModel(d.getModel());
        v.setFirstRegistrationDate(d.getFirstRegistrationDate());
        v.setLastTechnicalCheckDate(d.getLastTechnicalCheckDate());
        v.setTechnicalCheckValidUntil(d.getTechnicalCheckValidUntil());
        v.setStatus(d.getStatus());
        v.setFilePaths(d.getFilePaths());

        v.setProvider(d.getProviderId() != null
                ? providerService.findById(d.getProviderId())
                : null);

        System.out.println("==========================================");
        System.out.println(d.getProviderId());
        System.out.println("==========================================");


//        if (d.getAvlDeviceId() != null) {
//            AvlDevice avl = new AvlDevice();
//            avl.setId(d.getAvlDeviceId());
//            v.setAvlDevice(avl);
//        }
//
//        if (d.getRdstDeviceId() != null) {
//            RdstDevice rdst = new RdstDevice();
//            rdst.setId(d.getRdstDeviceId());
//            v.setRdstDevice(rdst);
//        }

        return v;
    }

    public void copyToEntity(VehicleDto d, Vehicle v) {
        v.setLicensePlate(d.getLicensePlate());
        v.setVinNum(d.getVinNum());
        v.setBrand(d.getBrand());
        v.setModel(d.getModel());
        v.setFirstRegistrationDate(d.getFirstRegistrationDate());
        v.setLastTechnicalCheckDate(d.getLastTechnicalCheckDate());
        v.setTechnicalCheckValidUntil(d.getTechnicalCheckValidUntil());
        v.setStatus(d.getStatus());
        v.setFilePaths(d.getFilePaths());

        v.setProvider    (d.getProviderId()     != null ? em.getReference(Provider.class,     d.getProviderId())     : null);
//        v.setAvlDevice   (d.getAvlDeviceId()    != null ? em.getReference(AvlDevice.class,    d.getAvlDeviceId())    : null);
//        v.setRdstDevice  (d.getRdstDeviceId()   != null ? em.getReference(RdstDevice.class,   d.getRdstDeviceId())   : null);
    }
}
