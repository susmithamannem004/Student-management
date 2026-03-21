package com.studentapp;

import com.studentapp.model.Student;
import com.studentapp.repository.StudentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(StudentRepository repo) {
        return args -> {
            if (repo.count() == 0) {
                repo.save(new Student("Priya Sharma",    "priya.sharma@edu.in",    "Computer Science", 20, "+91-9876543210", 2023, "Active"));
                repo.save(new Student("Rahul Verma",     "rahul.verma@edu.in",     "Mechanical Eng",   22, "+91-9876543211", 2021, "Active"));
                repo.save(new Student("Ananya Patel",    "ananya.patel@edu.in",    "Data Science",     21, "+91-9876543212", 2022, "Active"));
                repo.save(new Student("Karan Singh",     "karan.singh@edu.in",     "Electronics",      23, "+91-9876543213", 2020, "Graduated"));
                repo.save(new Student("Sneha Reddy",     "sneha.reddy@edu.in",     "Computer Science", 20, "+91-9876543214", 2023, "Active"));
                repo.save(new Student("Arjun Mehta",     "arjun.mehta@edu.in",     "Civil Eng",        24, "+91-9876543215", 2019, "Graduated"));
                repo.save(new Student("Divya Nair",      "divya.nair@edu.in",      "Data Science",     21, "+91-9876543216", 2022, "Active"));
                repo.save(new Student("Rohit Kumar",     "rohit.kumar@edu.in",     "Mechanical Eng",   22, "+91-9876543217", 2021, "Inactive"));
            }
        };
    }
}
