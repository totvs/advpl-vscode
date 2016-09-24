import stream = require('stream');

interface ProtocolMessage {
		/** Sequence number */
		seq: number;
		/** One of "request", "response", or "event" */
		type: string;
	}
     interface Parse extends ProtocolMessage {		
		command : string;
        success: boolean;
		/** The command requested */
		source: string;		
	}
    export interface Response extends ProtocolMessage {
		/** Sequence number of the corresponding request */
		request_seq: number;
		/** Outcome of the request */
		success: boolean;
		/** The command requested */
		command: string;
		/** Contains error message if success == false. */
		message?: string;
		/** Contains request result if success is true and optional error details if success is false. */
		body?: any;
	}

/** Client-initiated request */
	export interface Request extends ProtocolMessage {
		/** The command to execute */
		command: string;
		/** Object containing arguments for the command */
		arguments?: any;
	}
   export interface Event extends ProtocolMessage {
		/** Type of event */
		event: string;
		/** Event-specific information */
		body?: any;
	}


export class consoleProtocol {
	private static TWO_CRLF = '\r\n\r\n';

	private outputStream;
	private sequence: number;
	private pendingRequests: { [id: number]: (e: Response) => void; };
	private rawData: Buffer;
	private id: string;
	private contentLength: number;

	constructor() {
		this.sequence = 1;
		this.contentLength = -1;
		this.pendingRequests = {};
		this.rawData = new Buffer(0);
        //this.outputStream = outputStream;
		//this.id = uuid.generateUuid();
	}

	public getId(): string {
		return this.id;
	}

	public connect(readable: stream.Readable, writable: stream.Writable): void {

		this.outputStream = writable;

		readable.on('data', (data: Buffer) => {
			this.rawData = Buffer.concat([this.rawData, data]);
			this.handleData();
		});
	}

/*	protected send(command: string, args: any): TPromise<Response> {
		let errorCallback;
		return new TPromise((completeDispatch, errorDispatch) => {
			errorCallback = errorDispatch;
			this.doSend(command, args, (result: Response) => {
				if (result.success) {
					completeDispatch(result);
				} else {
					errorDispatch(result);
				}
			});
		}, () => errorCallback(canceled()));
	}*/

	public doSend(command: string, args: any, clb: (result: Response) => void): void {

		const request: Request = {
			type: 'request',
			seq: this.sequence++,
			command: command
		};
		if (args && Object.keys(args).length > 0) {
			request.arguments = args;
		}

		// store callback for this request
		this.pendingRequests[request.seq] = clb;

		const json = JSON.stringify(request);
		const length = Buffer.byteLength(json, 'utf8');

		this.outputStream.write('Content-Length: ' + length.toString() + consoleProtocol.TWO_CRLF, 'utf8');
		this.outputStream.write(json, 'utf8');
	}

	public handleData(): void {
		while (true) {
			if (this.contentLength >= 0) {
				if (this.rawData.length >= this.contentLength) {
					const message = this.rawData.toString('utf8', 0, this.contentLength);
					this.rawData = this.rawData.slice(this.contentLength);
					this.contentLength = -1;
					if (message.length > 0) {
						this.dispatch(message);
					}
					continue;	// there may be more complete messages to process
				}
			} else {
				const s = this.rawData.toString('utf8', 0, this.rawData.length);
				const idx = s.indexOf(consoleProtocol.TWO_CRLF);
				if (idx !== -1) {
					const match = /Content-Length: (\d+)/.exec(s);
					if (match && match[1]) {
						this.contentLength = Number(match[1]);
						this.rawData = this.rawData.slice(idx + consoleProtocol.TWO_CRLF.length);
						continue;	// try to handle a complete message
					}
				}
			}
			break;
		}
	}

	protected  onServerError(err: Error): void
    {

    }
	protected onEvent(event: Event):void {

    }

	private dispatch(body: string): void {
		try {
			const rawData = JSON.parse(body);
			if (typeof rawData.event !== 'undefined') {
				this.onEvent(rawData);
			} else {
				const response = <Response>rawData;
				const clb = this.pendingRequests[response.request_seq];
				if (clb) {
					delete this.pendingRequests[response.request_seq];
					clb(response);
				}
			}
		} catch (e) {
			this.onServerError(new Error(e.message || e));
		}
	}
}