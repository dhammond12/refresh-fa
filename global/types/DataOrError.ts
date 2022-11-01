type DataOrError<T = null> = { ok: true; data: T } | { ok: false; error: string };

export default DataOrError;
