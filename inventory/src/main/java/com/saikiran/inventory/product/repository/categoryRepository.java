package com.saikiran.inventory.product.repository;

import com.saikiran.inventory.product.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface categoryRepository extends JpaRepository<Category,Long> {

    Optional<Category> findByCategoryName(String mobile);


}
