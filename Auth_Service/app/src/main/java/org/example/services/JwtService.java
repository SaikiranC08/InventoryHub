package org.example.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {
    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    public static final String SECRET = "b1946ac92492d2347c6235b4d2611184c0a6e8a4e5d4f12e45c8c8bfb3e3aefd";

    // extracting username
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // extracting expiration date
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // is token expired
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // is token valid
    public Boolean validateToken(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    // create token
    public String createToken(Map<String, Object> claims, String username) {
        return Jwts.builder()
                   .setClaims(claims)
                   .setSubject(username)
                   .setIssuer("inventoryhub-auth")
                   .setIssuedAt(new Date(System.currentTimeMillis()))
                   .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                   .signWith(getSignKey(), SignatureAlgorithm.HS256)
                   .compact();
    }

    public String GenerateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        try {
            Long userId = userDetailsService.getUserIdByUsername(username);
            claims.put("userId", userId);
        } catch (Exception e) {
            System.out.println("Failed to fetch userId for " + username + ": " + e.getMessage());
        }
        return createToken(claims, username);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    // parsing claim data
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                   .setSigningKey(getSignKey())
                   .build()
                   .parseClaimsJws(token)
                   .getBody();
    }

    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}