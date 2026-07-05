package org.example.services;

import org.example.entities.UserInfo;
import org.example.entities.UserRole;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class CustomUserDetails extends UserInfo implements UserDetails {
    private String userName;
    private String password;
    Collection<? extends GrantedAuthority> Authorities;


    //constructor
    public CustomUserDetails(UserInfo user){
        this.setUserId(user.getUserId());
        this.userName = user.getUserName();
        this.password = user.getPassword();
        List<GrantedAuthority> auths = new ArrayList<>();

        for(UserRole role : user.getRoles()){
            auths.add(new SimpleGrantedAuthority(role.getName().toUpperCase()));
        }
        this.Authorities = auths;
    }

    public Long getUserId() {
        return super.getUserId();
    }



    @Override
    public Collection<? extends GrantedAuthority> getAuthorities(){
        return Authorities;
    }
    

    @Override
    public String getPassword(){
        return password;
    }

    @Override
    public String getUsername(){
        return userName;
    }

    @Override
    public boolean isAccountNonExpired() {

        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
