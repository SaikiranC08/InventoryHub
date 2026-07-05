package org.example.services;


import jakarta.persistence.GeneratedValue;
import org.example.entities.RefreshToken;
import org.example.entities.UserInfo;
import org.example.repository.RefreshTokenRepository;
import org.example.repository.UserInfoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    @Autowired
    RefreshTokenRepository refreshTokenRepository;
    @Autowired
    UserInfoRepository userInfoRepository;

    public RefreshToken createNewToken(String username) {
        UserInfo userInfoExtracted = userInfoRepository.findByUserName(username)
                                                       .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Check if a refresh token already exists for this user
        Optional<RefreshToken> existingToken = refreshTokenRepository.findByUserInfo(userInfoExtracted);

        RefreshToken refreshToken;
        if (existingToken.isPresent()) {
            // Reuse and update the existing token instead of inserting a new row
            refreshToken = existingToken.get();
            refreshToken.setToken(UUID.randomUUID().toString());
            refreshToken.setExpiryDate(Instant.now().plusMillis(600000));
        } else {
            // No token yet for this user ,create a new one
            refreshToken = RefreshToken.builder()
                                       .userInfo(userInfoExtracted)
                                       .token(UUID.randomUUID().toString())
                                       .expiryDate(Instant.now().plusMillis(600000))
                                       .build();
        }

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken verifyExpiration(RefreshToken refreshToken){
        if (refreshToken.getExpiryDate().compareTo(Instant.now())<0){
            refreshTokenRepository.delete(refreshToken);
            throw new RuntimeException(refreshToken.getToken()+ "refresh token got expiired ,please login once again");
        }
        return refreshToken;
    }

    public Optional<RefreshToken> findByToken(String token){
        return refreshTokenRepository.findByToken(token);
    }
}
