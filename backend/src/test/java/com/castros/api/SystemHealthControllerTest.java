package com.castros.api;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SystemHealthControllerTest {

    @Test
    void healthIsIndependentFromDatabaseReadiness() {
        SystemHealthController controller = new SystemHealthController(mock(JdbcTemplate.class));
        assertEquals("UP", controller.health().status());
    }

    @Test
    void readinessRequiresDatabaseConnectivity() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForObject("select 1", Integer.class)).thenReturn(1);

        SystemHealthController controller = new SystemHealthController(jdbc);
        assertEquals("UP", controller.readiness().status());
    }

    @Test
    void readinessFailsClosedWhenDatabaseIsUnavailable() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForObject("select 1", Integer.class))
            .thenThrow(new DataAccessResourceFailureException("database unavailable"));

        SystemHealthController controller = new SystemHealthController(jdbc);
        ResponseStatusException error = assertThrows(ResponseStatusException.class, controller::readiness);
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, error.getStatusCode());
    }
}
