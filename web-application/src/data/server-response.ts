export interface RecordObject<T> {
    Key: string;
    Record: T;
}

export interface ServerResponse<T> {
    message: RecordObject<T>[];
    success: boolean;
}
