package tech.yaxi.demo.model;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import static org.assertj.core.api.Assertions.assertThat;


class TransactionsTests {
    private final ObjectMapper objectMapper =
        Jackson2ObjectMapperBuilder.json().build();

    String loadFixture(String name) throws IOException {
        return new DefaultResourceLoader()
            .getResource("classpath:" + name)
            .getContentAsString(StandardCharsets.UTF_8);
    }

    @Test
    void testDeserialization() throws IOException {
        String transactionJson = loadFixture("transaction.json");

        Transaction transaction =
            objectMapper.readValue(transactionJson, Transaction.class);

        assertThat(transaction)
            .isEqualTo(new Transaction(
                Optional.empty(),
                Optional.empty(),
                Optional.of(LocalDate.of(2025, 7, 17)),
                Optional.of(LocalDate.of(2025, 7, 17)),
                Optional.empty(),
                Transaction.Status.BOOKED,
                Optional.empty(),
                Optional.empty(),
                Optional.empty(),
                Optional.of("485197594144176"),
                Optional.empty(),
                Optional.empty(),
                new Amount("EUR", new BigDecimal("-9.38")),
                Optional.empty(),
                Optional.empty(),
                List.of(),
                List.of(),
                Optional.of(new Transaction.Party(
                    Optional.of("Frankische.Bierbotschaf/Nurnberg"),
                    Optional.of("DE96120300009005290904"),
                    Optional.empty(),
                    Optional.empty())), 
                Optional.of(new Transaction.Party(
                    Optional.of("ISSUER"),
                    Optional.of("DE02120300000000202051"),
                    Optional.empty(),
                    Optional.empty())),
                List.of("VISA Debitkartenumsatz"),
                Optional.of("IDCP"),
                List.of(
                    new Transaction.IsoBankTransactionCode("PMNT", "ICDT", "STDO"),
                    new Transaction.SwiftTransactionCode("DDT"),
                    new Transaction.NationalBankTransactionCode("106", "DE")),
                Optional.empty()));
    }

    @Test
    void testDeserializesRandomTransactions() throws IOException, InvocationTargetException, IllegalAccessException {
        // Note that the used fixture consists of purely randomly generated data
        String json = loadFixture("random_transactions.json");
        var transactions = objectMapper.readValue(json, new TypeReference<List<Transaction>>() {});
        assertThat(transactions).hasSize(1000);

        // The idea of this test is that eventually, over all seen
        // transactions, all possible fields must have been set at least once
        // (e.g. Optionals have a value, lists are not empty, etc). Check that
        // this is the case.
        var tracker = ValueTracker.of(Transaction.class, Path.empty());
        for (var transaction : transactions) {
            tracker.track(transaction);
        }
        assertThat(tracker.seen()).isTrue();

        // Then check that all JSON fields are actually present in the Java mapping
        var untypedTransactions = objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() { });
        var untypedPaths = collectPaths(Path.empty(), untypedTransactions);
        var paths = tracker.collectPaths();
        var missing = new HashSet<>(untypedPaths);
        missing.removeAll(paths);
        assertThat(missing).isEmpty();
    }

    Set<Path> collectPaths(Path path, List<Map<String, Object>> value) {
        Set<Path> result = new HashSet<>();
        for (var element : value) {
            result.addAll(collectPaths(path, element));
        }
        return result;
    }

    Set<Path> collectPaths(Path path, Map<String, Object> value) {
        Set<Path> result = new HashSet<>();
        for (var entry : value.entrySet()) {
            var childPath = path.append(entry.getKey());
            if (entry.getValue() instanceof List) {
                var list = (List<?>) entry.getValue();
                if (!list.isEmpty()) {
                    var element = list.get(0);
                    if (element instanceof Map) {
                        @SuppressWarnings("unchecked")
                        var listOfMap = (List<Map<String, Object>>) list;
                        result.addAll(collectPaths(childPath, listOfMap));
                    }
                }
            } else if (entry.getValue() instanceof Map) {
                @SuppressWarnings("unchecked")
                var map = (Map<String, Object>) entry.getValue();
                result.addAll(collectPaths(childPath, map));
            }
            result.add(childPath);
        }
        return result;
    }

    interface ValueTracker {
        void track(Object object) throws IllegalAccessException, InvocationTargetException;
        boolean seen();
        Set<Path> collectPaths();

        static ValueTracker of(Type type, Path path) {
            var cls = type instanceof ParameterizedType
                ? (Class<?>) ((ParameterizedType) type).getRawType()
                : (Class<?>) type;
            if (cls.isAssignableFrom(Optional.class)) {
                return new OptionalValueTracker(type, path);
            } else if (cls.isAssignableFrom(List.class)) {
                return new ListValueTracker(type, path);
            } else if (Enum.class.isAssignableFrom(cls)) {
                return new EnumValueTracker(cls, path);
            } else if (cls.isPrimitive() || !cls.getPackage().getName().startsWith("tech.yaxi")) {
                return new SingleValueTracker(path);
            } else if (cls.getAnnotationsByType(JsonSubTypes.class).length > 0) {
                return new SubTypeValueTracker(cls, path);
            } else {
                return new RecordValueTracker(cls, path);
            }
        }
    }

    static class EnumValueTracker implements ValueTracker {
        private final Path path;
        private final int size;
        private Set<Object> seen;

        public EnumValueTracker(Class<?> cls, Path path) {
            this.path = path;
            this.size = cls.getEnumConstants().length;
            this.seen = new HashSet<>();
        }

        public void track(Object object) {
            assertThat(object).as(this.path.toString()).isNotNull();
            this.seen.add(object);
        }

        public boolean seen() {
            return this.seen.size() == this.size;
        }

        public Set<Path> collectPaths() {
            return Set.of(this.path);
        }
    }

    static class SingleValueTracker implements ValueTracker {
        private final Path path;
        private boolean seen = false;

        public SingleValueTracker(Path path) {
            this.path = path;
        }

        public void track(Object object) {
            assertThat(object).as(this.path.toString()).isNotNull();
            this.seen = true;
        }

        public boolean seen() {
            return this.seen;
        }

        public Set<Path> collectPaths() {
            return Set.of(this.path);
        }
    }

    static class OptionalValueTracker implements ValueTracker {
        private final Path path;
        private final ValueTracker tracker;
        private boolean seen = false;

        public OptionalValueTracker(Type type, Path path) {
            this.path = path;
            this.tracker = ValueTracker.of(((ParameterizedType) type).getActualTypeArguments()[0], path);
        }

        public void track(Object object) throws IllegalAccessException, InvocationTargetException {
            assertThat(object).as(this.path.toString()).isNotNull();
            var optional = (Optional<?>) object;
            if (optional.isPresent()) {
                this.seen = true;
                this.tracker.track(optional.get());
            }
        }

        public boolean seen() {
            return this.seen && this.tracker.seen();
        }

        public Set<Path> collectPaths() {
            var result = new HashSet<>(this.tracker.collectPaths());
            result.add(this.path);
            return result;
        }
    }

    static class ListValueTracker implements ValueTracker {
        private final Path path;
        private final ValueTracker tracker;
        private boolean seen = false;

        public ListValueTracker(Type type, Path path) {
            this.path = path;
            this.tracker = ValueTracker.of(((ParameterizedType) type).getActualTypeArguments()[0], path);
        }

        public void track(Object object) throws IllegalAccessException, InvocationTargetException {
            assertThat(object).as(this.path.toString()).isNotNull();
            var list = (List<?>) object;
            if (!list.isEmpty()) {
                this.seen = true;
                for (var element : list) {
                    this.tracker.track(element);
                }
            }
        }

        public boolean seen() {
            return this.seen && this.tracker.seen();
        }

        public Set<Path> collectPaths() {
            var result = new HashSet<>(this.tracker.collectPaths());
            result.add(this.path);
            return result;
        }
    }

    static class RecordValueTracker implements ValueTracker {
        private final Path path;
        private final Method[] methods;
        private final ValueTracker[] subTrackers;

        public RecordValueTracker(Class<?> cls, Path path) {
            this.path = path;
            this.methods = Stream.of(cls.getDeclaredMethods())
                .filter(m -> m.getParameterCount() == 0 && Modifier.isPublic(m.getModifiers()) && !m.getName().equals("toString") && !m.getName().equals("hashCode"))
                .toArray(Method[]::new);
            this.subTrackers = Stream.of(this.methods)
                .map(m -> ValueTracker.of(m.getGenericReturnType(), path.append(m.getName())))
                .toArray(ValueTracker[]::new);
        }

        public void track(Object object) throws IllegalAccessException, InvocationTargetException {
            assertThat(object).as(this.path.toString()).isNotNull();
            for (int i = 0; i < this.methods.length; ++i) {
                var value = this.methods[i].invoke(object);
                this.subTrackers[i].track(value);
            }
        }

        public boolean seen() {
            for (var tracker : this.subTrackers) {
                if (!tracker.seen()) {
                    return false;
                }
            }
            return true;
        }

        public Set<Path> collectPaths() {
            var result = new HashSet<Path>();
            for (var tracker : this.subTrackers) {
                result.addAll(tracker.collectPaths());
            }
            result.add(this.path);
            return result;
        }
    }

    static class SubTypeValueTracker implements ValueTracker {
        private final Path path;
        private final HashMap<Class<?>, ValueTracker> subTrackers;

        public SubTypeValueTracker(Class<?> cls, Path path) {
            this.path = path;
            this.subTrackers = new HashMap<>();

            for (var annotation : cls.getAnnotationsByType(JsonSubTypes.class)[0].value()) {
                this.subTrackers.put(
                    annotation.value(),
                    ValueTracker.of(annotation.value(), path.append(annotation.name())));
            }
        }

        public void track(Object object) throws IllegalAccessException, InvocationTargetException {
            assertThat(object).as(this.path.toString()).isNotNull();
            this.subTrackers.get(object.getClass()).track(object);
        }

        public boolean seen() {
           for (var tracker : this.subTrackers.values()) {
                if (!tracker.seen()) {
                    return false;
                }
           }
           return true;
        }

        public Set<Path> collectPaths() {
            var result = new HashSet<Path>();
            for (var tracker : this.subTrackers.values()) {
                result.addAll(tracker.collectPaths());
            }
            result.add(this.path);
            return result;
        }
    }

    static record Path(List<String> components) {
        public Path append(String component) {
            var newComponents = new ArrayList<>(this.components());
            newComponents.add(component);
            return new Path(newComponents);
        }

        @Override
        public String toString() {
            return String.join(" -> ", this.components());
        }

        public static Path empty() {
            return new Path(List.of());
        }
    }
}
