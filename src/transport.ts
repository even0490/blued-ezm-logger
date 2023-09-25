import os from 'os'
import {
  createStream,
  RotatingFileStream,
  Options,
} from 'rotating-file-stream'
import Transport, { TransportStreamOptions } from 'winston-transport'

const MESSAGE = Symbol.for('message')

interface FileRotateTransportOptions extends Options {
  filename: string;
  eol?: string;
  dateFormat?: string;
}

class FileRotateTransport extends Transport {
  eol?: string;

  stream: RotatingFileStream;

  constructor(options: FileRotateTransportOptions) {
    super(options as TransportStreamOptions)
    const { filename, eol, ...streamOptions } = options

    this.eol = eol || os.EOL
    this.stream = createStream(filename, streamOptions)
    bubbleEvents(['close', 'error'], this.stream, this)
  }

  log(info: any, callback: (a: any, b: any) => void) {
    this.stream.write(info[MESSAGE] + this.eol)
    this.emit('logged', info)
    if (callback) callback(null, true)
  }

  // eslint-disable-next-line no-underscore-dangle
  _final(callback: () => void) {
    this.stream.on('finish', callback)
    this.stream.end()
  }
}

function bubbleEvents(events: any, emitterA: any, emitterB: any) {
  for (const event of events) {
    emitterA.on(event, (...args: any[]) => {
      emitterB.emit(event, ...args)
    })
  }
}

export default FileRotateTransport
