import toast from 'react-hot-toast';

export const forceDownload = async (url: string, filename: string) => {
  try {
    if (!url) return;
    const toastId = toast.loading('Downloading...');
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    toast.success('Downloaded!', { id: toastId });
  } catch (error) {
    console.error('Download failed', error);
    toast.dismiss();
    toast.error('Failed to download file. It might be blocked by CORS.');
    // Fallback: open in new tab
    window.open(url, '_blank');
  }
};
