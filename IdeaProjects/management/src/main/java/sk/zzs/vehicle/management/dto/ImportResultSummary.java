package sk.zzs.vehicle.management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImportResultSummary {
    private SectionResult providers = new SectionResult();
    private SectionResult vehicles = new SectionResult();
    private SectionResult networkPoints = new SectionResult();
    private List<String> errors = new ArrayList<>();

    public static ImportResultSummary error(String message) {
        ImportResultSummary r = new ImportResultSummary();
        r.errors.add(message);
        return r;
    }

    public void addError(String msg) {
        errors.add(msg);
    }

    public void incImported(String section) {
        getSection(section).imported++;
    }

    public void incSkipped(String section) {
        getSection(section).skipped++;
    }

    private SectionResult getSection(String section) {
        return switch (section) {
            case "providers" -> providers;
            case "vehicles" -> vehicles;
            case "networkPoints" -> networkPoints;
            default -> throw new IllegalArgumentException("Unknown section: " + section);
        };
    }

    @Data
    public static class SectionResult {
        private int imported = 0;
        private int skipped = 0;
    }
}
