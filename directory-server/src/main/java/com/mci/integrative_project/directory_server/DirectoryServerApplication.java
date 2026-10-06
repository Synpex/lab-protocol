package com.mci.integrative_project.directory_server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DirectoryServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(DirectoryServerApplication.class, args);
	}

}
