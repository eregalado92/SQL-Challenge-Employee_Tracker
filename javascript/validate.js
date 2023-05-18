const validator = require('validator');

const validate = {
    validateString(str) {
        return str !== '' ? true : 'Enter a valid response';
    },
    validateSalary(num) {
        if (validator.isDecimal(num)) return true;
        return 'Enter a different salary';
    },
    isSame(str1, str2) {
        if (str1 === str2) return true;
        return false;
    }
};

module.exports = validate;
