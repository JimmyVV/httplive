export const HTTPCANCEL = 'HTTPCANCEL'; // abort the fetch event

/**
 * three flags
 */
export const CHUNKEDPROGRESS='CHUNKEDPROGRESS'; // for chunk event
export const CHUNKEDSTREAM='CHUNKEDSTREAM'; // for stream event
export const CHUNKEDEND='CHUNKEDEND';   // indicate the end of stream
export const CHUNKEDERR='CHUNKEDERR';   // indicate there is some error of stream