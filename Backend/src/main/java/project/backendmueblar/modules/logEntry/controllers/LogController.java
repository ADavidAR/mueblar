package project.backendmueblar.modules.logEntry.controllers;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import project.backendmueblar.modules.logEntry.entities.LogsEntity;
import project.backendmueblar.modules.logEntry.entities.dtos.responses.LogResponseDTO;
import project.backendmueblar.modules.logEntry.services.LogService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class LogController {
    private final LogService logService;

    // Obtencion de Todos los Registros de la Base de Datos mediante la Busqueda Filtrada //
    @GetMapping(produces = "application/json")
    public ResponseEntity<List<LogResponseDTO>> getLogsFromDBFilter(@NotNull @RequestParam(defaultValue = "10") Integer limit,
                                                                    @NotNull @RequestParam(defaultValue = "0") Integer page,
                                                                    @RequestParam(required = false) String tableName,
                                                                    @RequestParam(required = false) String operationName,
                                                                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ){
        return ResponseEntity.status(200).body(logService.getLogsFromDBFilter(limit, page, tableName, operationName, date));
    }
}
