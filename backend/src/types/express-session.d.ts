// import 'express-session';

// declare module 'express-session' {
//     interface SessionData {
//         user: {
//             github_username: string;
//             cloud_link: string;
//             linkIn_url: string;
//         };
//     }
// }

export interface B2File {
    id: string;       // The unique ID of the file
    name: string;      // The full path/name of the file
    type: string;   // MIME type of the file
    size: number; // Size in bytes
    uploadTimestamp: number; // Unix timestamp in milliseconds
}