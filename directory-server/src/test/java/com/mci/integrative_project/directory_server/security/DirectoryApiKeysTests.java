package com.mci.integrative_project.directory_server.security;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class DirectoryApiKeysTests {
    private static final String TEAM_A_KEY = "test-only-team-a-key-00000000000000000000";
    private static final String TEAM_B_KEY = "test-only-team-b-key-00000000000000000000";

    @Test
    void authenticatesDistinctKeysAndKeepsTeamIdentityOnRotation() {
        DirectoryApiKeys keys = new DirectoryApiKeys("team-a:" + TEAM_A_KEY + ",team-b:" + TEAM_B_KEY);
        assertEquals("team-a", keys.authenticate(TEAM_A_KEY));
        assertEquals("team-b", keys.authenticate(TEAM_B_KEY));
        assertNull(keys.authenticate(null));
        assertNull(keys.authenticate(""));
        assertNull(keys.authenticate(TEAM_A_KEY + "x"));
        DirectoryApiKeys rotated = new DirectoryApiKeys("team-a:" + TEAM_B_KEY);
        assertEquals("team-a", rotated.authenticate(TEAM_B_KEY));
        assertNull(rotated.authenticate(TEAM_A_KEY));
    }

    @Test
    void refusesEmptyMalformedWeakAndAmbiguousConfiguration() {
        for (String config : new String[] {
                "", "team-a", "team-a:short", "team a:" + TEAM_A_KEY,
                "team-a:" + TEAM_A_KEY + ",",
                "team-a:" + TEAM_A_KEY + ",team-a:" + TEAM_B_KEY,
                "team-a:" + TEAM_A_KEY + ",team-b:" + TEAM_A_KEY }) {
            IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                    () -> new DirectoryApiKeys(config));
            assertFalse(error.getMessage().contains(TEAM_A_KEY));
            assertFalse(error.getMessage().contains(TEAM_B_KEY));
        }
    }
}
