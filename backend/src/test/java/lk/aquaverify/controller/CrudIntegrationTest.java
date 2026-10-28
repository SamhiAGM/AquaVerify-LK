package lk.aquaverify.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import lk.aquaverify.dto.request.*;
import lk.aquaverify.entity.ComplaintCategory;
import lk.aquaverify.entity.ComplaintStatus;
import lk.aquaverify.entity.VerificationStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CrudIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;
    private String officerToken;
    private String labToken;
    private String citizenToken;

    @BeforeEach
    void setUp() throws Exception {
        adminToken = loginAndGetToken("admin@aquaverify.lk", "Admin@123");
        officerToken = loginAndGetToken("officer@aquaverify.lk", "Officer@123");
        labToken = loginAndGetToken("lab@aquaverify.lk", "Lab@123");
        citizenToken = loginAndGetToken("citizen@aquaverify.lk", "Citizen@123");
    }

    private String loginAndGetToken(String email, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest(email, password);
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        return objectMapper.readTree(body).path("data").path("token").asText();
    }

    @Test
    void testFullComplaintLifecycleAndAuthorization() throws Exception {
        // 1. Citizen creates a complaint
        ComplaintCreateRequest createReq = new ComplaintCreateRequest(
                "High turbidity and red algae in household tap water",
                "Water running from the kitchen tap shows cloudy red discoloration and a stagnant odor since morning.",
                ComplaintCategory.COLOR_DISCOLORATION,
                1L
        );

        MvcResult createResult = mockMvc.perform(post("/api/complaints")
                        .header("Authorization", "Bearer " + citizenToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.complaintReference", startsWith("AQV-")))
                .andExpect(jsonPath("$.data.status", is("PENDING")))
                .andReturn();

        long complaintId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 2. Citizen reads own complaint details
        mockMvc.perform(get("/api/complaints/" + complaintId)
                        .header("Authorization", "Bearer " + citizenToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.complaint.id", is((int) complaintId)))
                .andExpect(jsonPath("$.data.timeline", hasSize(greaterThanOrEqualTo(1))));

        // 3. Citizen updates pending complaint
        ComplaintUpdateRequest updateReq = new ComplaintUpdateRequest(
                "High turbidity and reddish algae in kitchen tap water (Updated)",
                "Added observation: Discoloration increases during peak hours in the morning.",
                ComplaintCategory.COLOR_DISCOLORATION,
                1L
        );

        mockMvc.perform(put("/api/complaints/" + complaintId)
                        .header("Authorization", "Bearer " + citizenToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title", containsString("(Updated)")));

        // 4. Admin assigns complaint to Officer
        ComplaintAssignRequest assignReq = new ComplaintAssignRequest(2L, "Assigned to Dilhani for immediate field check");
        mockMvc.perform(patch("/api/complaints/" + complaintId + "/assign")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.assignedOfficerId", is(2)))
                .andExpect(jsonPath("$.data.status", is("UNDER_INVESTIGATION")));

        // 5. Officer updates status with investigation note
        ComplaintStatusUpdateRequest statusReq = new ComplaintStatusUpdateRequest(
                ComplaintStatus.RESOLVED,
                "Pipeline flushed and chlorine level retested at 0.5 mg/L. Water clear."
        );

        mockMvc.perform(patch("/api/complaints/" + complaintId + "/status")
                        .header("Authorization", "Bearer " + officerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("RESOLVED")))
                .andExpect(jsonPath("$.data.resolvedAt", notNullValue()));

        // 6. Citizen attempts to delete RESOLVED complaint -> rejected by business rule
        mockMvc.perform(delete("/api/complaints/" + complaintId)
                        .header("Authorization", "Bearer " + citizenToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testWaterTestWorkflowAndVerification() throws Exception {
        // 1. Lab technician logs water test record
        WaterTestCreateRequest testReq = new WaterTestCreateRequest(
                2L,
                LocalDate.now(),
                new BigDecimal("7.15"),
                new BigDecimal("1.85"),
                "LAB-TEST-" + System.currentTimeMillis(),
                true // Submit for verification
        );

        MvcResult testResult = mockMvc.perform(post("/api/water-tests")
                        .header("Authorization", "Bearer " + labToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.verificationStatus", is("PENDING_VERIFICATION")))
                .andReturn();

        long testId = objectMapper.readTree(testResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 2. Unauthorized Citizen attempts to verify -> Forbidden 403
        WaterTestVerifyRequest verifyReq = new WaterTestVerifyRequest(VerificationStatus.VERIFIED, "Sample parameters conform to SLS 614 standard");
        mockMvc.perform(patch("/api/water-tests/" + testId + "/verify")
                        .header("Authorization", "Bearer " + citizenToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isForbidden());

        // 3. Authorized Officer verifies test record -> Success 200
        mockMvc.perform(patch("/api/water-tests/" + testId + "/verify")
                        .header("Authorization", "Bearer " + officerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.verificationStatus", is("VERIFIED")))
                .andExpect(jsonPath("$.data.verifiedById", is(2)));

        // 4. Public endpoint returns verified tests
        mockMvc.perform(get("/api/water-tests/verified"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    void testDashboardMetricsIntegration() throws Exception {
        // Public statistics
        mockMvc.perform(get("/api/dashboard/public-stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalComplaints", greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.data.monitoredSources", greaterThanOrEqualTo(4)));

        // Citizen dashboard
        mockMvc.perform(get("/api/dashboard/citizen")
                        .header("Authorization", "Bearer " + citizenToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.myTotalComplaints", greaterThanOrEqualTo(1)));

        // Admin dashboard
        mockMvc.perform(get("/api/dashboard/admin")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.registeredUsers", greaterThanOrEqualTo(4)))
                .andExpect(jsonPath("$.data.recentActivity", hasSize(greaterThanOrEqualTo(1))));
    }
}
