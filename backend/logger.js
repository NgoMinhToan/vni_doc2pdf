const log = (level, msg, extra = {}) => {
    const time = new Date().toISOString();
    const data = Object.keys(extra).length ? ` ${JSON.stringify(extra)}` : "";
    console.log(`[${time}] [${level}] ${msg}${data}`);
};

module.exports = {
    info: (msg, extra) => log("INFO", msg, extra),
    warn: (msg, extra) => log("WARN", msg, extra),
    error: (msg, extra) => log("ERROR", msg, extra)
};
