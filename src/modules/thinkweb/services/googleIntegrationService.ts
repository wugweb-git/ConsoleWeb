// TODO: replace with ThinkWeb admin API

export interface GoogleDocument {
  id: string;
  name: string;
  type: 'document' | 'spreadsheet' | 'presentation';
  webViewLink: string;
  modifiedTime: string;
  thumbnailLink?: string;
}

export interface GoogleAuthResponse {
  access_token: string;
  expires_in: number;
  scope: string;
}

class GoogleIntegrationService {
  private accessToken: string | null = null;
  private readonly CLIENT_ID = import.meta.env.VITE_THINKWEB_GOOGLE_CLIENT_ID;
  private readonly DISCOVERY_DOCS = [
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
    'https://www.googleapis.com/discovery/v1/apis/docs/v1/rest',
    'https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest',
    'https://www.googleapis.com/discovery/v1/apis/slides/v1/rest'
  ];
  private readonly SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/documents.readonly',
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/presentations.readonly'
  ];

  async initializeGoogleAPI(): Promise<boolean> {
    try {
      // Load Google API
      await this.loadGoogleAPI();
      return true;
    } catch (error) {
      console.error('Failed to initialize Google API:', error);
      return false;
    }
  }

  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('auth2:client', resolve);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async signIn(): Promise<boolean> {
    try {
      if (!this.CLIENT_ID) {
        throw new Error('Google Client ID not configured');
      }

      await window.gapi.client.init({
        clientId: this.CLIENT_ID,
        discoveryDocs: this.DISCOVERY_DOCS,
        scope: this.SCOPES.join(' ')
      });

      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      
      if (user.isSignedIn()) {
        this.accessToken = user.getAuthResponse().access_token;
        localStorage.setItem('google_access_token', this.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Google sign-in failed:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      this.accessToken = null;
      localStorage.removeItem('google_access_token');
    } catch (error) {
      console.error('Google sign-out failed:', error);
    }
  }

  isSignedIn(): boolean {
    const token = localStorage.getItem('google_access_token');
    return !!token && !!this.accessToken;
  }

  async getDocuments(): Promise<GoogleDocument[]> {
    try {
      if (!this.isSignedIn()) {
        throw new Error('Not signed in to Google');
      }

      const response = await window.gapi.client.drive.files.list({
        q: "mimeType='application/vnd.google-apps.document' or mimeType='application/vnd.google-apps.spreadsheet' or mimeType='application/vnd.google-apps.presentation'",
        fields: 'files(id,name,mimeType,webViewLink,modifiedTime,thumbnailLink)',
        orderBy: 'modifiedTime desc',
        pageSize: 50
      });

      return response.result.files.map((file: any) => ({
        id: file.id,
        name: file.name,
        type: this.getMimeType(file.mimeType),
        webViewLink: file.webViewLink,
        modifiedTime: file.modifiedTime,
        thumbnailLink: file.thumbnailLink
      }));
    } catch (error) {
      console.error('Failed to fetch Google documents:', error);
      return [];
    }
  }

  private getMimeType(mimeType: string): 'document' | 'spreadsheet' | 'presentation' {
    if (mimeType.includes('document')) return 'document';
    if (mimeType.includes('spreadsheet')) return 'spreadsheet';
    if (mimeType.includes('presentation')) return 'presentation';
    return 'document';
  }

  async importDocument(documentId: string): Promise<string | null> {
    try {
      const response = await window.gapi.client.docs.documents.get({
        documentId: documentId
      });

      // Extract text content from Google Doc
      const content = this.extractTextFromGoogleDoc(response.result);
      return content;
    } catch (error) {
      console.error('Failed to import Google document:', error);
      return null;
    }
  }

  private extractTextFromGoogleDoc(doc: any): string {
    let text = '';
    
    if (doc.body && doc.body.content) {
      for (const element of doc.body.content) {
        if (element.paragraph) {
          for (const textElement of element.paragraph.elements || []) {
            if (textElement.textRun) {
              text += textElement.textRun.content;
            }
          }
        }
      }
    }
    
    return text;
  }
}

// Extend window interface for Google API
declare global {
  interface Window {
    gapi: any;
  }
}

export const googleIntegrationService = new GoogleIntegrationService();
