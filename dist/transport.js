"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const rotating_file_stream_1 = require("rotating-file-stream");
const winston_transport_1 = __importDefault(require("winston-transport"));
const MESSAGE = Symbol.for('message');
class FileRotateTransport extends winston_transport_1.default {
    constructor(options) {
        super(options);
        const { filename, eol, ...streamOptions } = options;
        this.eol = eol || os_1.default.EOL;
        this.stream = rotating_file_stream_1.createStream(filename, streamOptions);
        bubbleEvents(['close', 'error'], this.stream, this);
    }
    log(info, callback) {
        this.stream.write(info[MESSAGE] + this.eol);
        this.emit('logged', info);
        if (callback)
            callback(null, true);
    }
    // eslint-disable-next-line no-underscore-dangle
    _final(callback) {
        this.stream.on('finish', callback);
        this.stream.end();
    }
}
function bubbleEvents(events, emitterA, emitterB) {
    for (const event of events) {
        emitterA.on(event, (...args) => {
            emitterB.emit(event, ...args);
        });
    }
}
exports.default = FileRotateTransport;
//# sourceMappingURL=transport.js.map