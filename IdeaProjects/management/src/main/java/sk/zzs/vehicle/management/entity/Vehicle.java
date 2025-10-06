package sk.zzs.vehicle.management.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import sk.zzs.vehicle.management.enumer.VehicleStatus;
import sk.zzs.vehicle.management.listener.VehicleListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
// NEW: one active row per VIN; allow duplicates only when archived=true
@Table(name = "vehicle", uniqueConstraints = {
        @UniqueConstraint(name = "uniq_vehicle_vin_archived", columnNames = {"vin_num","provider_id", "archived"})
})
@Data
@EntityListeners(VehicleListener.class)
//@SQLDelete(sql = "UPDATE vehicle SET archived = true, archived_at = NOW() WHERE id = ?")
@Where(clause = "archived = false")

public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Unique vehicle ID (SPZ or internal ID)
    @Column(nullable = false, unique = true)
    private String licensePlate;

    // NEW: no global uniqueness; uniqueness is enforced with archived flag
    @Column(nullable = false)
    private String vinNum;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String model;

    private LocalDate firstRegistrationDate;

    private LocalDate lastTechnicalCheckDate;

    private LocalDate technicalCheckValidUntil;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleStatus status;

    // relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id")
    private Provider provider;

//    @ManyToOne(fetch = FetchType.LAZY)      // no cascade here
//    @JoinColumn(name = "avl_id")
//    private AvlDevice avlDevice;
//
//    @ManyToOne(fetch = FetchType.LAZY)      // same for RDST, Provider, etc.
//    @JoinColumn(name = "rdst_id")
//    private RdstDevice rdstDevice;

    @ElementCollection
    @CollectionTable(name = "vehicle_files", joinColumns = @JoinColumn(name = "vehicle_id"))
    @Column(name = "path")
    private List<String> filePaths = new ArrayList<>();

    @Column(nullable = false)
    private boolean archived = false;

//    private LocalDateTime archivedAt;
//
//    private String archivedBy;
//
////    @Column(name = "archived_reason", length = 512)
//    private String archivedReason;

}
