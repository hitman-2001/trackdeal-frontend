import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

/**
 * Downloads or shares an Excel workbook across Web and Native Android.
 * On native Android, it writes the XLSX binary to the Cache directory and invokes
 * the native Share dialog, allowing the user to Save to Downloads, Open with Sheets/Excel, or share.
 * On web, it triggers a standard browser file download.
 *
 * @param {Object} wb - XLSX workbook object
 * @param {string} filename - Target filename e.g. 'Template.xlsx'
 */
export async function downloadExcelWorkbook(wb, filename) {
  const XLSX = await import('xlsx');

  if (Capacitor.isNativePlatform()) {
    try {
      // Generate base64 representation of the workbook
      const base64Data = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });

      // Save file to native cache
      const fileResult = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache,
      });

      // Open Android system share/save dialog
      await Share.share({
        title: filename,
        text: filename,
        url: fileResult.uri,
        dialogTitle: `Save or Open ${filename}`,
      });
      return;
    } catch (err) {
      console.warn('Native filesystem/share fallback triggered:', err);
      if (err.message && (err.message.toLowerCase().includes('canceled') || err.message.toLowerCase().includes('dismissed'))) {
        return;
      }
    }
  }

  // Web fallback using XLSX.writeFile
  XLSX.writeFile(wb, filename);
}

