package org.example.services;

import lombok.AllArgsConstructor;
import org.example.entities.UserInfo;
import org.example.model.UserInfoDto;
import org.example.repository.UserInfoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Objects;
import java.util.UUID;


@Component
@AllArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private final UserInfoRepository userInfoRepository;
    @Autowired
    private final PasswordEncoder passwordEncoder;


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserInfo user = userInfoRepository.findByUserName(username)
                .orElseThrow(() -> new UsernameNotFoundException("could not found user ..."));
        return new CustomUserDetails(user);
    }

    public UserDetails loadUserById(Long userId) throws UsernameNotFoundException {
        UserInfo user = userInfoRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("could not find user with id: " + userId));
        return new CustomUserDetails(user);
    }

    public UserInfo checkIfUserExists(UserInfoDto userInfoDto){
        return userInfoRepository.findByUserName(userInfoDto.getUserName()).orElse(null);
    }


    //validating email
    public boolean validateEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        return email != null && email.matches(emailRegex);
    }

    //validating phone number
    public boolean validateNumber(String number) {

        if (number == null || number.isBlank()) {
            return false;
        }

        String cleanNumber = number.replaceAll("\\s+", "");

        return cleanNumber.matches("^\\+?[0-9]{10,15}$");
    }





    public boolean siginupUser(UserInfoDto userInfoDto){

        //validation
        if (!validateEmail(userInfoDto.getEmail())) {
            throw new IllegalArgumentException("Invalid email format!");
        }
        if(!validateNumber(userInfoDto.getPhoneNumber())){
            throw new IllegalArgumentException("Invalid phone number");
        }


        userInfoDto.setPassword(passwordEncoder.encode(userInfoDto.getPassword()));
        if(Objects.nonNull(checkIfUserExists(userInfoDto))){
            return false;
        }
        userInfoRepository.save(new UserInfo(null,userInfoDto.getUserName(),userInfoDto.getPassword(),
                userInfoDto.getEmail(), userInfoDto.getPhoneNumber(), new HashSet<>()));

        return true;
    }

    public Long getUserIdByUsername(String username) {
        UserInfo user = userInfoRepository.findByUserName(username)
                                  .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return user.getUserId();
    }

}
