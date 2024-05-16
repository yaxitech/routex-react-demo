package tech.yaxi.demo.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

public record Transaction(
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
        Status status
        ) {

    static enum Status {
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

    static record BatchDetails(
            References references,
            /**
             * Transaction amount as billed to the account.
             */
            Optional<Amount> amount,
            /**
             * Indicator for reversals.
             */
            boolean reversal,
            /**
             * Original amount of the transaction.
             */
            Optional<Amount> originalAmount,
            /**
             * Exchange rates.
             */
            Optional<List<ExchangeRate>> exchanges,
            /**
             * Any fees related to the transaction.
             */
            Optional<List<Fee>> fees,
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
            List<String> remittanceInformation,
            /**
             * ISO 20022 ExternalPurpose1Code.
             */
            Optional<String> purposeCode,
            /**
             * Bank Transaction Codes.
             */
            Optional<List<BankTransactionCode>> BankTransactionCodes,
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

    static record BatchData(
            List<BatchDetails> transactions
            ) {

    }

    static record Party(
            Optional<String> id,
            Optional<String> name,
            Optional<AccountReference> account,
            Optional<String> bic,
            Optional<String> ultimate
            ) {

    }

    static record ExchangeRate(
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
            BigDecimal exchangeRate
            ) {

    }

    static record Fee(
            Amount amount,
            Optional<FeeType> kind,
            /**
             * ISO 20022 BICFIIdentifier of the agent to whom the charges are
             * due.
             */
            Optional<String> bic
            ) {

    }

    @JsonNaming(PropertyNamingStrategies.UpperCamelCaseStrategy.class)
    static record BankTransactionCode(
            /**
             * ISO 20022 Bank Transaction Code.
             */
            Optional<IsoBankTransactionCode> iso,
            /**
             * SWIFT transaction code.
             */
            Optional<String> swift,
            /**
             * BAI2 transaction code.
             */
            Optional<String> bai,
            /**
             * National transaction code, e.g. German GVC.
             */
            Optional<NationalBankTransactionCode> national,
            /**
             * Unspecified transaction codes, possibly with an issuer
             * information.
             */
            Optional<OtherBankTransactionCode> other
            ) {

    }

    static record IsoBankTransactionCode(
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
            String sub_family
            ) {

    }

    static record NationalBankTransactionCode(
            String code,
            /**
             * ISO-3166-1 ALPHA-2 country code
             */
            String country
            ) {

    }

    static record OtherBankTransactionCode(
            String code,
            Optional<String> issuer
            ) {

    }

    static enum FeeType {
        @JsonProperty("Amendment")
        AMENDMENT,
        @JsonProperty("Batch")
        BATCH,
        @JsonProperty("Brokerage")
        BROKERAGE,
        @JsonProperty("Claim")
        CLAIM,
        @JsonProperty("Commission")
        COMMISSION,
        @JsonProperty("Confirmation")
        CONFIRMATION,
        @JsonProperty("Payment")
        PAYMENT,
        @JsonProperty("Postage")
        POSTAGE,
        @JsonProperty("Telecommunication")
        TELECOMMUNICATION,
        @JsonProperty("Total")
        TOTAL,
    }

    static record AccountReference(
            AccountIdentifier id,
            Optional<String> currency
            ) {

    }

    @JsonNaming(PropertyNamingStrategies.UpperCamelCaseStrategy.class)
    static record AccountIdentifier(
            /**
             * ISO 20022 IBAN2007Identifier.
             */
            Optional<String> Iban,
            /**
             * ISO 20022 BBANIdentifier for accounts that do not have an IBAN.
             */
            Optional<String> Bban,
            /**
             * Primary Account Number of a card.
             */
            Optional<String> Pan,
            /**
             * Primary Account Number of a card in masked form.
             */
            Optional<String> MaskedPan,
            /**
             * Registered mobile phone number.
             */
            Optional<String> Msisdn
            ) {

    }

    static record References(
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
            Optional<String> creditorId
            ) {

    }
}
