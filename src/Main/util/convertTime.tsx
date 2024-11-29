function convertTime(time: string): string {
  if (!time) {
    return 'loading';
  }

  // Create a Date object from the UTC time string
  const utcDate = new Date(time);


    // Format the time
  const hours = utcDate.getHours();
  const minutes = utcDate.getMinutes();
  const isAm = hours < 12;

  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes} ${isAm ? 'am' : 'pm'}`;
}

export default convertTime;