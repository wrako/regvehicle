package sk.zzs.vehicle.management.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import sk.zzs.vehicle.management.dto.VehicleLogBlockDto;
import sk.zzs.vehicle.management.dto.VehicleLogDto;
import sk.zzs.vehicle.management.entity.VehicleLog;
import sk.zzs.vehicle.management.enumer.OperationType;
import sk.zzs.vehicle.management.repository.VehicleLogRepository;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@Transactional(readOnly = true)
public class VehicleLogService {
    private final VehicleLogRepository repo;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public VehicleLogService(VehicleLogRepository repo) { this.repo = repo; }

    @Transactional
    public VehicleLog add(VehicleLog e) { return repo.save(e); }

    @Transactional
    public VehicleLog edit(Long id, VehicleLog e) {
        if (!repo.existsById(id)) throw CrudUtils.notFound("VehicleLog", id);
        e.setId(id);
        return repo.save(e);
    }

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) throw CrudUtils.notFound("VehicleLog", id);
        repo.deleteById(id);
    }


    public List<VehicleLog> getAllForVehicle(Long vehicleId) {
        // (Optional) ensure vehicle exists → 404 if not
//        if (!repo.existsById(vehicleId)) {
//            throw new ResponseStatusException(NOT_FOUND, "Vehicle not found: " + vehicleId);
//        }
        return repo.findByVehicleIdOrderByTimestampDesc(vehicleId);
    }

    public List<VehicleLog> getAll() { return repo.findAll(); }

    /**
     * Get all logs for a vehicle, grouped by Provider blocks.
     * Each block represents a period during which the Vehicle was assigned to a specific Provider.
     *
     * Block boundaries:
     * - Start: CREATE, UNARCHIVE, or provider change
     * - End: ARCHIVE, DELETE, or provider change
     */
    public List<VehicleLogBlockDto> getGroupedLogsByVehicle(Long vehicleId) {
        // Get all logs in chronological order (oldest first)
        List<VehicleLog> allLogs = repo.findByVehicleIdOrderByTimestampDesc(vehicleId);

        // Reverse to get chronological order (oldest first)
        List<VehicleLog> logs = new ArrayList<>(allLogs);
        Collections.reverse(logs);

        List<VehicleLogBlockDto> blocks = new ArrayList<>();
        VehicleLogBlockDto currentBlock = null;
        Long currentProviderId = null;

        for (VehicleLog log : logs) {
            OperationType op = log.getOperation();
            Long logProviderId = log.getProviderId();

            // Determine if we need to start a new block
            boolean startNewBlock = false;

            if (currentBlock == null) {
                // First log always starts a new block
                startNewBlock = true;
            } else if (op == OperationType.CREATE || op == OperationType.UNARCHIVE) {
                // CREATE and UNARCHIVE always start new blocks
                startNewBlock = true;
            } else if (!Objects.equals(currentProviderId, logProviderId)) {
                // Provider change starts a new block
                startNewBlock = true;
            }

            if (startNewBlock) {
                // Close previous block if exists
                if (currentBlock != null) {
                    blocks.add(currentBlock);
                }

                // Start new block
                currentBlock = new VehicleLogBlockDto();
                currentBlock.setProviderId(logProviderId);
                currentBlock.setProviderName(log.getProviderName() != null ? log.getProviderName() : "Unknown");
                currentBlock.setLogs(new ArrayList<>());
                currentProviderId = logProviderId;
            }

            // Add log to current block
            VehicleLogDto logDto = convertToDto(log);
            currentBlock.getLogs().add(logDto);

            // Check if this log ends the current block
            if (op == OperationType.ARCHIVE || op == OperationType.DELETE) {
                blocks.add(currentBlock);
                currentBlock = null;
                currentProviderId = null;
            }
        }

        // Add last block if it wasn't closed
        if (currentBlock != null) {
            blocks.add(currentBlock);
        }

        return blocks;
    }

    /**
     * Get all logs for a vehicle in simple DTO format (no grouping)
     */
    public List<VehicleLogDto> getAllLogsAsDtoByVehicle(Long vehicleId) {
        List<VehicleLog> logs = repo.findByVehicleIdOrderByTimestampDesc(vehicleId);
        return logs.stream()
                .map(this::convertToDto)
                .toList();
    }

    private VehicleLogDto convertToDto(VehicleLog log) {
        VehicleLogDto dto = new VehicleLogDto();
        dto.setId(log.getId());
        dto.setVehicleId(log.getVehicleId());
        dto.setLicensePlate(log.getLicensePlate());
        dto.setVinNum(log.getVinNum());
        dto.setBrand(log.getBrand());
        dto.setModel(log.getModel());
        dto.setFirstRegistrationDate(log.getFirstRegistrationDate());
        dto.setLastTechnicalCheckDate(log.getLastTechnicalCheckDate());
        dto.setTechnicalCheckValidUntil(log.getTechnicalCheckValidUntil());
        dto.setProviderId(log.getProviderId());
        dto.setProviderName(log.getProviderName());
        dto.setAuthor(log.getAuthor());
        dto.setTimestamp(log.getTimestamp());
        dto.setTimestampFormatted(log.getTimestamp() != null ? log.getTimestamp().format(FORMATTER) : null);
        dto.setOperation(log.getOperation() != null ? log.getOperation().name() : null);
        return dto;
    }
}
