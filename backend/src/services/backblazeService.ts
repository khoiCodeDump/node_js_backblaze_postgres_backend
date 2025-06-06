import B2 from 'backblaze-b2';
import dotenv from 'dotenv';
import { B2File } from '../types/express-session';

dotenv.config();

export class BackblazeService {
    private b2: B2;
    private static instance: BackblazeService;

    private constructor() {
      this.b2 = new B2({
        applicationKeyId: process.env.B2_APPLICATION_KEY_ID!,
        applicationKey: process.env.B2_APPLICATION_KEY!,
      });
    }
    
    public static getInstance(): BackblazeService {
        if (!BackblazeService.instance) {
            BackblazeService.instance = new BackblazeService();
        }
        return BackblazeService.instance;
    }
    async createFolder(folderName: string) {
        try {
            await this.b2.authorize();
            const response = await this.b2.createBucket({
                bucketName: folderName,
                bucketType: 'allPrivate',
            });
            return response.data;
        } catch (error) {
            console.error('Error creating folder in Backblaze B2:', error);
            throw error;
        }
    }

    async uploadFile(bucketId: string, filePath: string, fileData: Buffer): Promise<B2File> {
        try {
            await this.b2.authorize();
            
            // Get upload URL
            const uploadUrlResponse = await this.b2.getUploadUrl({ bucketId });
            const { uploadUrl, authorizationToken } = uploadUrlResponse.data;

            console.log(filePath);
            // Upload file
            const uploadResponse = await this.b2.uploadFile({
                uploadUrl,
                uploadAuthToken: authorizationToken,
                fileName: filePath,
                data: fileData,
            });

            // Extract just the filePath from the path
            const displayName = filePath.split('/').pop() || filePath;
            
            return {
                id: uploadResponse.data.fileId,
                name: displayName,
                uploadTimestamp: uploadResponse.data.uploadTimestamp,
                size: uploadResponse.data.contentLength,
                type: uploadResponse.data.contentType
            };
        } catch (error) {
            console.error('Error uploading file to Backblaze B2:', error);
            throw error;
        }
    }

    async listBucketFiles(bucketId: string): Promise<B2File[]> {
        try {
            await this.b2.authorize();
            
            const response = await this.b2.listFileNames({
                bucketId,
                maxFileCount: 1000,
                delimiter: '/',
                startFileName: '',
                prefix: ''
            });

            return response.data.files.map((file: any) => ({
                name: file.fileName,
                id: file.fileId,
                size: file.contentLength,
                uploadTimestamp: file.uploadTimestamp,
                type: file.contentType
            } as B2File));
            
        } catch (error) {
            console.error('Error listing files from Backblaze B2:', error);
            throw error;
        }
    }

    async downloadFile(fileId: string): Promise<{ data: Buffer; fileName: string; contentType: string }> {
        try {
            await this.b2.authorize();
            
            // Get file info first
            const fileInfo = await this.b2.getFileInfo({
                fileId: fileId
            });
            
            if(fileInfo.data.fileName.endsWith(".folder")) {
                // Get the folder path (remove .folder extension)
                const folderPath = fileInfo.data.fileName.slice(0, -7);
                
                // List all files in the bucket
                const response = await this.b2.listFileNames({
                    bucketId: fileInfo.data.bucketId,
                    maxFileCount: 1000,
                    startFileName: '',
                    delimiter: '',
                    prefix: ''
                });
                
                // Filter files to only include those in this folder
                const filesInFolder = response.data.files
                    .filter((file: any) => {
                        // Must start with folder path but not be the folder itself
                        if (file.fileName === fileInfo.data.fileName) return false;
                        if (!file.fileName.startsWith(folderPath)) return false;
                        
                        // Get the relative path after removing folder prefix
                        const relativePath = file.fileName.substring(folderPath.length + 1);
                        
                        // Only include direct children (no additional path separators)
                        return !relativePath.includes('/');
                    })
                    .map((file: any) => ({
                        name: file.fileName.endsWith('.folder') 
                            ? file.fileName.slice(0, -7) // Remove .folder extension
                            : file.fileName,
                        id: file.fileId,
                        size: file.contentLength,
                        type: file.fileName.endsWith('.folder') ? 'folder' : file.contentType
                    }));
                
                // Return the folder contents
                return {
                    data: Buffer.from(JSON.stringify(filesInFolder)),
                    fileName: folderPath,
                    contentType: 'application/json'
                };
            }
            
            // Download the file directly from B2
            const downloadUrl = await this.b2.downloadFileById({
                fileId: fileId,
                responseType: 'arraybuffer'  // Important for binary files
            });

            return {
                data: downloadUrl.data,
                fileName: fileInfo.data.fileName,
                contentType: fileInfo.data.contentType
            };
        } catch (error) {
            console.error('Error downloading file from Backblaze B2:', error);
            throw error;
        }
    }

    async deleteFile(fileId: string): Promise<{ success: boolean; message: string }> {
        try {
            await this.b2.authorize();
            
            // Get file info first to get the fileName
            const fileInfo = await this.b2.getFileInfo({
                fileId: fileId
            });

            // Delete the file from B2
            await this.b2.deleteFileVersion({
                fileId: fileId,
                fileName: fileInfo.data.fileName
            });

            return {
                success: true,
                message: 'File deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting file from B2:', error);
            throw error;
        }
    }
}
