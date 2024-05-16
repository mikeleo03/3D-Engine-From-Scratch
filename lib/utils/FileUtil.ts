class FileUtil {
  static downloadFile(file: File) {
    // Create a temporary URL for the File object
    const url = window.URL.createObjectURL(file);

    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name; // Use the file name from the File object

    // Simulate a click on the link to trigger the download
    link.click();

    // Clean up by revoking the Object URL
    window.URL.revokeObjectURL(url);
  }
}