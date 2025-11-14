package tech.yaxi.demo.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.annotation.Nulls;


public record Transaction(
        /**
         * Identifier used for delta requests.
        */
        Optional<String> entryReference,
        Optional<BatchData> batch,
        /**
         * Booking date (ASPSP's books).
         */
        Optional<LocalDate> bookingDate,
        /**
         * Value date. Expected / requested value date in case of pending
         * entries.
         */
        Optional<LocalDate> valueDate,
        /**
         * Date of the actual transaction, e.g. a card payment.
         */
        Optional<LocalDate> transactionDate,
        /**
         * Transaction status.
         */
        Status status,
        /**
         * Unique reference assigned by the account servicer.
         */
        Optional<String> accountServicerReference,
        /**
         * Unique identifier assigned by the sending party.
         */
        Optional<String> paymentId,
        /**
         * Unique identifier assigned by the first instructing agent.
         */
        Optional<String> transactionId,
        /**
         * Unique end-to-end identifier assigned by the initiating party.
         */
        Optional<String> endToEndId,
        /**
         * Mandate identifier.
         */
        Optional<String> mandateId,
        /**
         * SEPA creditor identifier.
         */
        Optional<String> creditorId,
        /**
         * Transaction amount as billed to the account.
         */
        Amount amount,
        /**
         * Indicator for reversals.
         */
        Optional<Boolean> reversal,
        /**
         * Original amount of the transaction.
         */
        Optional<Amount> originalAmount,
        /**
         * Exchange rates.
         */
        @JsonSetter(nulls = Nulls.AS_EMPTY)
        List<ExchangeRate> exchanges,
        /**
         * Any fees related to the transaction.
         */
        @JsonSetter(nulls = Nulls.AS_EMPTY)
        List<Fee> fees,
        /**
         * Creditor data. In case of reversals, this refers to the initial
         * transaction.
         */
        Optional<Party> creditor,
        /**
         * Debtor data. In case of reversals, this refers to the initial
         * transaction.
         */
        Optional<Party> debtor,
        /**
         * Remittance (purpose).
         */
        @JsonSetter(nulls = Nulls.AS_EMPTY)
        List<String> remittanceInformation,
        /**
         * ISO 20022 ExternalPurpose1Code.
         */
        Optional<String> purposeCode,
        /**
         * Bank Transaction Codes.
         */
        @JsonSetter(nulls = Nulls.AS_EMPTY)
        List<BankTransactionCode> bankTransactionCodes,
        /**
         * Additional information attached to the transaction.
         *
         * This might be a proprietary, localized, human-readable long text
         * corresponding to some machine-readable bank transaction code that
         * is not directly provided by the bank.
         */
        Optional<String> additionalInformation
        ) {

    public static enum Status {
        /**
         * The transaction is expected / planned.
         */
        @JsonProperty("Pending")
        PENDING,
        /**
         * The transaction is booked to the account. This is typically the final
         * state for most accounts.
         */
        @JsonProperty("Booked")
        BOOKED,
        /**
         * The credit card transaction is booked and invoiced but not yet paid.
         */
        @JsonProperty("Invoiced")
        INVOICED,
        /**
         * The credit card transaction is paid. This is typically the final
         * state for card accounts.
         */
        @JsonProperty("Paid")
        PAID,
        /**
         * The transaction has been canceled in some way.
         */
        @JsonProperty("Canceled")
        CANCELED,
    }

    public static record BatchDetails(
            /**
             * Unique reference assigned by the account servicer.
             */
            Optional<String> accountServicerReference,
            /**
             * Unuiqe identifier assigned by the sending party.
             */
            Optional<String> paymentId,
            /**
             * Unique identifier assigned by the first instructing agent.
             */
            Optional<String> transactionId,
            /**
             * Unique end-to-end identifier assigned by the initiating party.
             */
            Optional<String> endToEndId,
            /**
             * Mandate identifier.
             */
            Optional<String> mandateId,
            /**
             * SEPA creditor identifier.
             */
            Optional<String> creditorId,
            /**
             * Transaction amount as billed to the account.
             */
            Optional<Amount> amount,
            /**
             * Indicator for reversals.
             */
            Optional<Boolean> reversal,
            /**
             * Original amount of the transaction.
             */
            Optional<Amount> originalAmount,
            /**
             * Exchange rates.
             */
            @JsonSetter(nulls = Nulls.AS_EMPTY)
            List<ExchangeRate> exchanges,
            /**
             * Any fees related to the transaction.
             */
            @JsonSetter(nulls = Nulls.AS_EMPTY)
            List<Fee> fees,
            /**
             * Creditor data. In case of reversals, this refers to the initial
             * transaction.
             */
            Optional<Party> creditor,
            /**
             * Debtor data. In case of reversals, this refers to the initial
             * transaction.
             */
            Optional<Party> debtor,
            /**
             * Remittance (purpose).
             */
            @JsonSetter(nulls = Nulls.AS_EMPTY)
            List<String> remittanceInformation,
            /**
             * ISO 20022 ExternalPurpose1Code.
             */
            Optional<String> purposeCode,
            /**
             * Bank Transaction Codes.
             */
            @JsonSetter(nulls = Nulls.AS_EMPTY)
            List<BankTransactionCode> bankTransactionCodes,
            /**
             * Additional information attached to the transaction.
             *
             * This might be a proprietary, localized, human-readable long text
             * corresponding to some machine-readable bank transaction code that
             * is not directly provided by the bank.
             */
            Optional<String> additionalInformation
            ) {

    }

    public static record BatchData(
            Optional<Number> numberOfTransactions,
            List<BatchDetails> transactions
            ) {

    }

    public static record Party(
            /**
             * Name.
             */
            Optional<String> name,
            /**
             * IBAN.
             */
            Optional<String> iban,
            /**
             * ISO 20022 BICFIIdentifier.
             */
            Optional<String> bic,
            /**
             * Name of the ultimate party on whose behalf the transaction is conducted.
             */
            Optional<String> ultimate
            ) {

    }

    public static record ExchangeRate(
            /**
             * ISO 4217 Alpha 3 currency code of the source currency that gets
             * converted.
             */
            String sourceCurrency,
            /**
             * ISO 4217 Alpha 3 currency code of the target currency that the
             * source currency gets converted into.
             */
            Optional<String> targetCurrency,
            /**
             * ISO 4217 Alpha 3 currency code of the unit currency for the
             * exchange rate.
             */
            Optional<String> unitCurrency,
            /**
             * Numeric exchange rate.
             */
            BigDecimal exchangeRate
            ) {

    }

    public static record Fee(
            /**
             * Amount of the fee.
             */
            Amount amount,
            /**
             * ISO 20022 ExternalChargeType1Code for the fee.
             */
            Optional<String> kind,
            /**
             * ISO 20022 BICFIIdentifier of the agent to whom the charges are
             * due.
             */
            Optional<String> bic
            ) {

    }

    /**
     * Marker interface for a bank transaction code.
     */
    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.WRAPPER_OBJECT)
    @JsonSubTypes({
        @JsonSubTypes.Type(value = IsoBankTransactionCode.class, name = "iso"),
        @JsonSubTypes.Type(value = SwiftTransactionCode.class, name = "swift"),
        @JsonSubTypes.Type(value = Bai2TransactionCode.class, name = "bai"),
        @JsonSubTypes.Type(value = NationalBankTransactionCode.class, name = "national"),
        @JsonSubTypes.Type(value = OtherBankTransactionCode.class, name = "other"),
    })
    interface BankTransactionCode {
    }

    /**
     * ISO 20022 Bank Transaction Code.
     */
    public static record IsoBankTransactionCode(
            /**
             * ISO 20022 ExternalBankTransactionDomain1Code.
             */
            String domain,
            /**
             * ISO 20022 ExternalBankTransactionFamily1Code.
             */
            String family,
            /**
             * ISO 20022 ExternalBankTransactionSubFamily1Code.
             */
            String subFamily
            ) implements BankTransactionCode {
    }


    /**
     * SWIFT transaction code.
     */
    public static record SwiftTransactionCode(@JsonValue String swift) implements BankTransactionCode {
    }

    /**
     * BAI2 transaction code.
     */
    public static record Bai2TransactionCode(@JsonValue String bai) implements BankTransactionCode {
    }

    /**
     * National transaction code, e.g. German GVC.
     */
    public static record NationalBankTransactionCode(
            /**
             * Code.
             */
            String code,
            /**
             * ISO-3166-1 ALPHA-2 country code
             */
            String country
            ) implements BankTransactionCode {

    }

    /**
     * Unspecified transaction codes, possibly with an issuer
     * information.
     */
    public static record OtherBankTransactionCode(
            /**
             * Code.
             */
            String code,
            /**
             * The issuer of the code.
             */
            Optional<String> issuer
            ) implements BankTransactionCode {

    }
}
