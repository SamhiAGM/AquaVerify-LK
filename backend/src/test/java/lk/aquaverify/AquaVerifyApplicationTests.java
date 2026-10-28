package lk.aquaverify;

import lk.aquaverify.entity.Role;
import lk.aquaverify.entity.User;
import lk.aquaverify.repository.ComplaintRepository;
import lk.aquaverify.repository.UserRepository;
import lk.aquaverify.repository.WaterSourceRepository;
import lk.aquaverify.repository.WaterTestRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AquaVerifyApplicationTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WaterSourceRepository waterSourceRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private WaterTestRepository waterTestRepository;

    @Test
    void contextLoadsAndSeedDataVerified() {
        // Verify database connection and seed data
        assertTrue(userRepository.count() >= 4);
        assertTrue(waterSourceRepository.count() >= 4);
        assertTrue(complaintRepository.count() >= 2);
        assertTrue(waterTestRepository.count() >= 2);

        // Verify Admin user
        Optional<User> admin = userRepository.findByEmail("admin@aquaverify.lk");
        assertTrue(admin.isPresent());
        assertEquals(Role.ADMIN, admin.get().getRole());
        assertEquals("Colombo", admin.get().getDistrict());

        // Verify Citizen user
        Optional<User> citizen = userRepository.findByEmail("citizen@aquaverify.lk");
        assertTrue(citizen.isPresent());
        assertEquals(Role.CITIZEN, citizen.get().getRole());

        // Verify Officer user
        Optional<User> officer = userRepository.findByEmail("officer@aquaverify.lk");
        assertTrue(officer.isPresent());
        assertEquals(Role.OFFICER, officer.get().getRole());

        // Verify Lab Technician user
        Optional<User> lab = userRepository.findByEmail("lab@aquaverify.lk");
        assertTrue(lab.isPresent());
        assertEquals(Role.LAB_TECHNICIAN, lab.get().getRole());
    }
}
