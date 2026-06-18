package com.saikiran.inventory.business.repository;

import com.saikiran.inventory.business.entity.Business;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusinessRepository extends JpaRepository<Business,Long> {

    List<Business> findByOwnerId(Long id);

    Optional<Business> findByOwnerIdAndBusinessId(Long ownerId, Long id);

    void deleteByBusinessIdAndOwnerId(Long id, Long ownerId);
}
