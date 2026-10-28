package lk.aquaverify.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordEncoderTest {

    @Test
    void testPasswordEncoding() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String[] passwords = {"Admin@123", "Officer@123", "Lab@123", "Citizen@123"};
        for (String pwd : passwords) {
            String hash = encoder.encode(pwd);
            System.out.println("PWD: " + pwd + " -> HASH: " + hash);
            assertTrue(encoder.matches(pwd, hash));
        }
    }
}
