package com.saikiran.inventory.common.config;

import com.saikiran.inventory.business.service.BusinessService;
import com.saikiran.inventory.common.exception.BusinessAccessDeniedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BusinessSecurityInterceptorTest {

    @Mock
    private BusinessService businessService;

    private BusinessSecurityInterceptor interceptor;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setUp() {
        interceptor = new BusinessSecurityInterceptor(businessService);
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
    }

    @Test
    void shouldAllowRequestWhenUserIsOwnerOfBusiness() throws Exception {
        request.addHeader("X-Business-Id", "10");
        request.addHeader("X-User-Id", "1");

        when(businessService.isUserOwnerOfBusiness(1L, 10L)).thenReturn(true);

        boolean result = interceptor.preHandle(request, response, new Object());

        assertTrue(result);
    }

    @Test
    void shouldThrowAccessDeniedWhenUserIsNotOwnerOfBusiness() {
        request.addHeader("X-Business-Id", "10");
        request.addHeader("X-User-Id", "1");

        when(businessService.isUserOwnerOfBusiness(1L, 10L)).thenReturn(false);

        assertThrows(BusinessAccessDeniedException.class, () ->
                interceptor.preHandle(request, response, new Object())
        );
    }

    @Test
    void shouldThrowAccessDeniedWhenBusinessIdPresentButUserIdMissing() {
        request.addHeader("X-Business-Id", "10");

        assertThrows(BusinessAccessDeniedException.class, () ->
                interceptor.preHandle(request, response, new Object())
        );
    }

    @Test
    void shouldAllowRequestWhenBusinessIdNotPresent() throws Exception {
        boolean result = interceptor.preHandle(request, response, new Object());

        assertTrue(result);
    }
}
