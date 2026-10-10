package com.mci.integrative_project.directory_server;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "directory.api-keys=test:context-test-key-0000000000000000000000")
class DirectoryServerApplicationTests {

	@Test
	void contextLoads() {
	}

}
