import libphonenumber from "google-libphonenumber";
import { Either } from "../aux";

const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
const PNF = libphonenumber.PhoneNumberFormat;
const DEFAULT_REGION = "US";
const DEFAULT_FORMAT = PNF.NATIONAL;

function parse(rawPhoneNumber) {
    if (!rawPhoneNumber) {
        return Either.Right("");
    }

    const number = phoneUtil.parseAndKeepRawInput(
        rawPhoneNumber,
        DEFAULT_REGION
    );
    return phoneUtil.isValidNumber(number)
        ? Either.Right(phoneUtil.format(number, DEFAULT_FORMAT))
        : Either.Left(`${number.getRawInput()} is not a valid phone number`);
}

function isValid(rawPhoneNumber) {
    return Either.isLeft(parse(rawPhoneNumber));
}

export default {
    isValid,
    parse,
};
