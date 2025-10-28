export function addDays(dateStr, n) {
    // Tách ngày/tháng/năm
    const [day, month, year] = dateStr.split("/").map(Number);
  
    // Tạo đối tượng Date
    const date = new Date(year, month - 1, day);
  
    // Cộng (hoặc trừ) số ngày
    date.setDate(date.getDate() + n);
  
    // Trả về định dạng dd/MM/yyyy
    const newDay = String(date.getDate()).padStart(2, "0");
    const newMonth = String(date.getMonth() + 1).padStart(2, "0");
    const newYear = date.getFullYear();
  
    return `${newDay}/${newMonth}/${newYear}`;
  }