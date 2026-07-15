/**
 * services/uploadService.js
 *
 * File Upload Service.
 * File uploads are now handled inline via multipart FormData
 * in submissionApi.createSubmission() and submissionApi.uploadReview().
 *
 * This module is kept for backward compatibility but its methods
 * are no longer used by the primary submission flow.
 */

/**
 * Downloads a file from an S3 URL by opening it in a new tab.
 *
 * @param {string} url - The S3 signed URL
 * @param {string} fileName - Suggested file name (browser may override)
 */
import config from '../config';

export const downloadFromUrl = async (url, fileName) => {
  if (!url) {
    console.warn('[uploadService] No URL provided for download');
    return;
  }
  try {
    const token = localStorage.getItem('rpms_token');
    
    const isProxyUrl = url.startsWith('/') || url.includes('/api/pdf/');
    let fetchUrl;
    if (isProxyUrl) {
      const relativePath = url.startsWith('/') ? url : new URL(url).pathname;
      const origin = new URL(config.apiBaseUrl).origin;
      fetchUrl = `${origin}${relativePath}`;
    } else {
      fetchUrl = `${config.apiBaseUrl}/download-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(fileName || 'document.pdf')}`;
    }

    const response = await fetch(fetchUrl, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('[uploadService] Proxy download failed, falling back to direct window.open:', err);
    window.open(url, '_blank');
  }
};
