"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const colors_1 = __importDefault(require("colors"));
const mkdirp_1 = require("mkdirp");
const dayjs_1 = __importDefault(require("dayjs"));
const winston_1 = __importDefault(require("winston"));
const transport_1 = __importDefault(require("./transport"));
const common_1 = require("./utils/common");
const development = process.env.NODE_ENV === 'development';
const production = process.env.NODE_ENV === 'production';
const localPath = path_1.default.join(path_1.default.dirname(__dirname), '../logs');
const servePath = '/data/logs/';
const situation = !(development || production);
const root = !situation ? servePath : localPath;
function luckyLogger(config = {}) {
    const defaults = {
        appName: 'app',
        dailyRotateFile: {
            maxFiles: 30,
            maxSize: '100M',
        },
        fileName: 'app',
        format: winston_1.default.format.json(),
        root,
    };
    const options = Object.assign({}, defaults, config);
    let logsPath = path_1.default.join(options.root, options.appName);
    // log output directory
    if (!fs_1.default.existsSync(logsPath)) {
        try {
            mkdirp_1.mkdirp.sync(logsPath);
        }
        catch (err) {
            console.log(colors_1.default.red(`Create '${servePath}' directory is failure!`));
            logsPath = path_1.default.join(localPath, options.appName);
            mkdirp_1.mkdirp.sync(logsPath);
        }
    }
    const timestamp = () => dayjs_1.default(new Date()).format('YYYY-MM-DD HH:mm:ss');
    const { maxFiles, maxSize } = options.dailyRotateFile;
    const openMeans = {};
    common_1.levels.forEach((data) => {
        const logger = winston_1.default.createLogger({
            level: 'verbose',
            format: options.format,
            transports: [
                new transport_1.default({
                    filename: options.appName,
                    size: maxSize,
                    interval: '1d',
                    immutable: false,
                    intervalBoundary: true,
                    path: logsPath,
                    rotate: maxFiles,
                }),
            ],
        });
        // If it is a local environment
        // The log will be displayed in the terminal
        if (situation) {
            const pass = data.type === 'info' || data.type === 'warn';
            logger.add(new winston_1.default.transports.Console({
                format: winston_1.default.format.combine(winston_1.default.format.printf((info) => {
                    const { message } = info;
                    const news = pass
                        ? colors_1.default[data.color](JSON.stringify(message))
                        : colors_1.default[data.color](message);
                    const response = `[${timestamp()}][${data.type}] ${data.icon} \n${news}`;
                    return response;
                })),
            }));
        }
        openMeans[data.type] = logger;
    });
    /**
     * handleLogger
     * Consolidation log
     * @param {Object} data
     */
    function handleLogger({ level, datum, } = {}) {
        const data = Object.assign({}, datum, {
            timestamp: timestamp(),
        });
        if (!(level === null || level === void 0 ? void 0 : level.type))
            return;
        openMeans[level.type][level.type](data);
    }
    /**
     * handleDaily
     */
    function handleDaily() {
        const result = {};
        common_1.levels.forEach((data) => {
            const content = {
                error: null,
                message: null,
            };
            result[data.type] = (...args) => {
                if (args.length > 0) {
                    const temp = args[0];
                    if (data.type === 'error') {
                        content.error = temp;
                        content.message = args[1] || null;
                    }
                    else {
                        content.message = temp;
                    }
                }
                const datum = common_1.handleDefault({
                    err: content.error,
                    message: content.message,
                });
                handleLogger({
                    level: data,
                    datum,
                });
            };
        });
        return result;
    }
    return handleDaily();
}
exports.default = luckyLogger;
//# sourceMappingURL=index.js.map