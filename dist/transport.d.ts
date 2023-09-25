import { RotatingFileStream, Options } from 'rotating-file-stream';
import Transport from 'winston-transport';
interface FileRotateTransportOptions extends Options {
    filename: string;
    eol?: string;
    dateFormat?: string;
}
declare class FileRotateTransport extends Transport {
    eol?: string;
    stream: RotatingFileStream;
    constructor(options: FileRotateTransportOptions);
    log(info: any, callback: (a: any, b: any) => void): void;
    _final(callback: () => void): void;
}
export default FileRotateTransport;
