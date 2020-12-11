const { DateTime } = require(`luxon`);

module.exports = {
  dateToFormat(date, format) {
    return DateTime.fromJSDate(date, { zone: `utc` }).toFormat(
      String(format),
    );
  },
};
