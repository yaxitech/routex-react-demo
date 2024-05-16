package tech.yaxi.demo;

import javax.crypto.spec.SecretKeySpec;

import java.text.ParseException;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Supplier;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.proc.BadJOSEException;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jose.proc.SingleKeyJWSKeySelector;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import com.nimbusds.jwt.proc.JWTProcessor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

@Component
public class TicketService {

    private static final long DEFAULT_VALIDITY_MINS = 10;
    private static final Logger LOGGER = LoggerFactory.getLogger(TicketService.class);

    private final JWSHeader header;
    private final JWSSigner signer;
    private final JWTProcessor<SecurityContext> jwtProcessor;
    private final Clock clock;
    private final Supplier<UUID> idSupplier;

    @Autowired
    public TicketService(@Value("${yaxi.keyId}") String keyId, @Value("${yaxi.key}") String key) {
        this(keyId, Base64.getDecoder().decode(key), Clock.systemUTC(), UUID::randomUUID);
    }

    TicketService(String keyId, byte[] key, Clock clock, Supplier<UUID> idSupplier) {
        this.header = new JWSHeader.Builder(JWSAlgorithm.HS256)
                .keyID(keyId)
                .type(JOSEObjectType.JWT)
                .build();
        try {
            this.signer = new MACSigner(key);
        } catch (JOSEException e) {
            throw new IllegalArgumentException(e);
        }
        this.jwtProcessor = createJwtProcessor(key);
        this.clock = clock;
        this.idSupplier = idSupplier;
        LOGGER.info("Using key '{}' for issuing tickets", keyId);
    }

    public Ticket issueTicket(String service, @Nullable Object data) {
        var exp = ChronoUnit.MINUTES.addTo(Instant.now(this.clock), DEFAULT_VALIDITY_MINS);
        var id = idSupplier.get();

        var claimsData = new HashMap<String, Object>();
        claimsData.put("service", service);
        claimsData.put("id", id.toString());
        claimsData.put("data", data);

        var claims = new JWTClaimsSet.Builder()
                .expirationTime(Date.from(exp))
                .claim("data", claimsData)
                .build();
        var jwt = new SignedJWT(this.header, claims);
        try {
            jwt.sign(this.signer);
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }

        return new Ticket(id, jwt.serialize());
    }

    public <I, R> TicketResult<R> verifyResults(String data, Converter<I, R> dataConverter) {
        var claims = parseJwtAndCheckSignature(data);
        Map<String, Object> dataClaim;
        try {
            dataClaim = claims.getJSONObjectClaim("data");
        } catch (ParseException e) {
            throw new InvalidResultException(e);
        }
        Object ticketId = dataClaim.get("ticketId");
        if (!(ticketId instanceof String)) {
            throw new InvalidResultException("Ticket ID missing");
        }
        @SuppressWarnings("unchecked")
        var resultData = (I) dataClaim.get("data");
        return new TicketResult<>(
                UUID.fromString((String) ticketId),
                dataConverter.convert(resultData));
    }

    private JWTClaimsSet parseJwtAndCheckSignature(final String data) {
        SignedJWT jwt;
        try {
            jwt = SignedJWT.parse(data);
        } catch (ParseException e) {
            throw new InvalidResultException(e);
        }
        try {
            // The processor is configured to verify the JWT's signature
            this.jwtProcessor.process(jwt, null);
        } catch (BadJOSEException | JOSEException e) {
            throw new InvalidResultException(e);
        }

        try {
            return jwt.getJWTClaimsSet();
        } catch (ParseException e) {
            throw new InvalidResultException(e);
        }
    }

    private JWTProcessor<SecurityContext> createJwtProcessor(byte[] key) {
        var processor = new DefaultJWTProcessor<>();
        var expectedKey = new SecretKeySpec(key, "MAC");
        processor.setJWSKeySelector(new SingleKeyJWSKeySelector<>(JWSAlgorithm.HS256, expectedKey));
        return processor;
    }
}
