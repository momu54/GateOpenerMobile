type Status = 'success' | 'failed';
export interface ResultMessage {
	status: Status;
	message: string;
}
