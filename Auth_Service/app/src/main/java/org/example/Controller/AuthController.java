package org.example.Controller;

import org.example.entities.RefreshToken;
import org.example.model.UserInfoDto;
import org.example.response.JwtResponseDTO;
import org.example.services.JwtService;
import org.example.services.RefreshTokenService;
import org.example.services.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.example.entities.UserInfo;
import org.example.repository.UserInfoRepository;

@RestController
@RequestMapping("/auth/v1")
public class AuthController {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;
    
    @Autowired
    private UserInfoRepository userInfoRepository;

    @PostMapping("/signup")
    public ResponseEntity Signup(@RequestBody UserInfoDto userInfoDto){
        try{
            // Debug logging to see what data we received
            System.out.println("Received signup request:");
            System.out.println("Username: '" + userInfoDto.getUserName() + "'");
            System.out.println("Email: '" + userInfoDto.getEmail() + "'");
            System.out.println("Phone: '" + userInfoDto.getPhoneNumber() + "'");
            System.out.println("Password: " + (userInfoDto.getPassword() != null ? "[PROVIDED]" : "[NULL]"));
            Boolean isSigned = userDetailsService.siginupUser(userInfoDto);
            if(Boolean.FALSE.equals(isSigned)){
                return new ResponseEntity<> ("Already user exists", HttpStatus.BAD_REQUEST);
            }
            RefreshToken refreshToken = refreshTokenService.createNewToken(userInfoDto.getUserName());
            Long userId = userDetailsService.getUserIdByUsername(userInfoDto.getUserName());
            String jwtToken = jwtService.GenerateToken(userId);
            return new ResponseEntity<>(JwtResponseDTO.builder().accessToken(jwtToken).
                    token(refreshToken.getToken()).build(), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Exception in signup: " + e.getMessage());
            return new ResponseEntity<>("Exception in User Service: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Debug endpoint to check users in database
    @GetMapping("/debug/users")
    public ResponseEntity getAllUsers() {
        try {
            List<UserInfo> users = StreamSupport.stream(userInfoRepository.findAll().spliterator(), false)
                    .collect(Collectors.toList());
            
            if (users.isEmpty()) {
                return ResponseEntity.ok("No users found in database");
            }
            
            return ResponseEntity.ok(users.stream().map(user -> {
                return "UserID: " + user.getUserId() +
                       ", Username: " + user.getUserName() + 
                       ", Email: " + user.getEmail() + 
                       ", Phone: " + user.getPhoneNumber() + 
                       ", Password: " + (user.getPassword() != null ? "[ENCRYPTED]" : "[NULL]");
            }).collect(Collectors.toList()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    
    // Debug endpoint to show database tables info
    @GetMapping("/debug/info")
    public ResponseEntity getDatabaseInfo() {
        return ResponseEntity.ok("Database: authservice at 192.168.64.4:3306\n" +
                                "Main table: Users (contains user_id, user_name, email, phone_number, password)\n" +
                                "Related tables: users_roles, roles, refresh_token");
    }
}
