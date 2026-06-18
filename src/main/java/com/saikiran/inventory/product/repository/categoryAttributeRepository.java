package com.saikiran.inventory.product.repository;

import com.saikiran.inventory.product.entities.CategoryAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface categoryAttributeRepository extends JpaRepository<CategoryAttribute,Long> {


    List<CategoryAttribute> findByCategoryCategoryId(Long categoryId);
}
